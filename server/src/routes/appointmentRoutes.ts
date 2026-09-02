import { Router, Response } from "express"
import { Appointment } from "../models/Appointment.js"
import { Doctor } from "../models/Doctor.js"
import { Organization } from "../models/Organization.js"
import { Patient } from "../models/Patient.js"
import { User } from "../models/User.js"
import { Notification } from "../models/Notification.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"
import { emitToUser } from "../services/socketService.js"
import {
  sendAppointmentAcceptedEmailToPatient,
  sendAppointmentAcceptedEmailToDoctor
} from "../services/emailService.js"

const router = Router()

// GET /api/appointments (Filtered by role)
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { status, type, date, doctorId, organizationId } = req.query

    const filter: any = {}

    // Role-based scoping
    if (user.role === "PATIENT") {
      filter.patientUserId = user._id
    } else if (user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({ userId: user._id })
      if (doctor) filter.doctorId = doctor._id
    } else if (user.role === "RECEPTIONIST") {
      const { Receptionist } = await import("../models/Receptionist.js")
      const receptionist = await Receptionist.findOne({ userId: user._id })
      if (receptionist) filter.organizationId = receptionist.organizationId
    }

    if (status && typeof status === "string") {
      filter.status = status
    }
    if (type && typeof type === "string") {
      filter.type = type
    }
    if (date && typeof date === "string") {
      filter.date = date
    }
    if (doctorId && typeof doctorId === "string") {
      filter.doctorId = doctorId
    }
    if (organizationId && typeof organizationId === "string") {
      filter.organizationId = organizationId
    }

    const appointments = await Appointment.find(filter)
      .populate("doctorId")
      .populate("organizationId")
      .populate("patientUserId", "name email phone avatar")
      .populate("patientId", "patientId medicalHistory allergies")
      .sort({ date: -1, startTime: -1 })
      .lean()

    const formatted = appointments.map((apt: any) => ({
      ...apt,
      id: apt._id.toString(),
      doctor: apt.doctorId ? {
        id: apt.doctorId._id.toString(),
        name: apt.doctorId.name,
        specialization: apt.doctorId.specialization,
        avatar: apt.doctorId.avatar
      } : { id: "doc_default", name: "Attending Doctor", specialization: "General Medicine" },
      organization: apt.organizationId ? {
        id: apt.organizationId._id.toString(),
        name: apt.organizationId.name,
        address: apt.organizationId.address,
        city: apt.organizationId.city
      } : { id: "org_default", name: "Healthcare Center", city: "Ahmedabad" },
      patientName: apt.patientName || apt.patientUserId?.name || "Patient",
      patientIdentifier: apt.patientId?.patientId || `PAT-${(apt.patientUserId?._id || apt._id).toString().slice(-6).toUpperCase()}`,
      patientEmail: apt.patientUserId?.email || `${(apt.patientName || "patient").toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      patientPhone: apt.patientPhone || apt.patientUserId?.phone || "+91 98765 43210",
      timeStr: apt.startTime,
      consultationType: apt.type,
      attendance: apt.attendanceStatus
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching appointments" })
  }
})

// GET /api/appointments/:id
router.get("/:id", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apt = await Appointment.findById(req.params.id)
      .populate("doctorId")
      .populate("organizationId")
      .populate("patientUserId")
      .lean()

    if (!apt) {
      res.status(404).json({ success: false, message: "Appointment not found." })
      return
    }

    res.status(200).json({
      success: true,
      data: {
        ...apt,
        id: apt._id.toString(),
        doctor: apt.doctorId,
        organization: apt.organizationId,
        timeStr: apt.startTime,
        consultationType: apt.type
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching appointment details" })
  }
})

// POST /api/appointments (Rule 1 & 133: Atomic Slot Booking with double-booking lock)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const {
      doctorId,
      organizationId,
      date,
      startTime,
      endTime,
      type = "Physical",
      appointmentFor = "Myself",
      beneficiaryName,
      symptoms = [],
      notes
    } = req.body

    if (!doctorId || !organizationId || !date || !startTime) {
      res.status(400).json({
        success: false,
        message: "Doctor ID, Organization ID, date, and startTime are required to book an appointment."
      })
      return
    }

    // 1. Verify Doctor & Org
    let doctor: any = null
    try {
      doctor = await Doctor.findById(doctorId)
    } catch {}
    if (!doctor) {
      doctor = await Doctor.findOne({ active: true })
    }
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor is unavailable or not found." })
      return
    }

    let organization: any = null
    try {
      organization = await Organization.findById(organizationId)
    } catch {}
    if (!organization && doctor.organizationId) {
      organization = await Organization.findById(doctor.organizationId).catch(() => null)
    }
    if (!organization) {
      organization = await Organization.findOne({ listingStatus: "ACTIVE" })
    }
    if (!organization) {
      res.status(404).json({ success: false, message: "Healthcare organization not found." })
      return
    }

    // 2. ATOMIC DOUBLE-BOOKING CHECK (Rule 1 & Rule 33)
    const existingConflict = await Appointment.findOne({
      doctorId,
      date,
      startTime,
      status: { $in: ["PENDING", "ACCEPTED", "CONFIRMED", "COMPLETED"] }
    })

    if (existingConflict) {
      res.status(409).json({
        success: false,
        code: "SLOT_CONFLICT",
        message: "This time slot has just been booked by another patient. Please choose a different slot."
      })
      return
    }

    // 3. Find Patient Profile if exists
    const patientProfile = await Patient.findOne({ userId: user._id })

    // 4. Generate Telemedicine Room ID if online
    const telemedicineRoomId = type === "Online" ? `room_med_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` : undefined

    const newAppointment = await Appointment.create({
      patientId: patientProfile?._id,
      patientUserId: user._id,
      patientName: beneficiaryName || user.name,
      patientPhone: user.phone,
      doctorId,
      organizationId,
      date,
      startTime,
      endTime: endTime || "",
      type,
      status: "PENDING",
      appointmentFor,
      beneficiaryName,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      notes,
      fee: type === "Online" ? (doctor.telemedicineFee || 400) : (doctor.consultationFee || 500),
      paymentStatus: "pending",
      telemedicineRoomId
    })

    // 5. Create In-App Notification for Patient & Doctor
    const patientMsg = `Your appointment request for ${date} at ${startTime} with ${doctor.name} has been sent for approval.`
    await Notification.create({
      userId: user._id,
      type: "appointment",
      title: "Appointment Request Submitted",
      message: patientMsg,
      relatedAppointmentId: newAppointment._id
    })
    emitToUser(user._id.toString(), "new-notification", {
      title: "Appointment Request Submitted",
      message: patientMsg,
      appointmentId: newAppointment._id
    })

    const doctorMsg = `New appointment requested by ${user.name} for ${date} at ${startTime}.`
    const docPayload = {
      appointmentId: newAppointment._id,
      patientName: user.name,
      doctorName: doctor.name,
      date,
      startTime,
      type
    }

    if (doctor.userId) {
      await Notification.create({
        userId: doctor.userId,
        type: "appointment",
        title: "🩺 New Appointment Request",
        message: doctorMsg,
        relatedAppointmentId: newAppointment._id
      })
      emitToUser(doctor.userId.toString(), "new-notification", {
        title: "🩺 New Appointment Request",
        message: doctorMsg,
        ...docPayload
      })
      emitToUser(doctor.userId.toString(), "new-appointment-request", docPayload)
    }

    if (doctor._id) {
      emitToUser(doctor._id.toString(), "new-notification", {
        title: "🩺 New Appointment Request",
        message: doctorMsg,
        ...docPayload
      })
      emitToUser(doctor._id.toString(), "new-appointment-request", docPayload)
    }

    if (organizationId) {
      emitToUser(organizationId.toString(), "new-appointment-request", docPayload)
    }

    res.status(201).json({
      success: true,
      message: "Appointment request submitted successfully.",
      data: {
        ...newAppointment.toObject(),
        id: newAppointment._id.toString(),
        doctor: {
          id: doctor._id.toString(),
          name: doctor.name,
          specialization: doctor.specialization
        },
        organization: {
          id: organization._id.toString(),
          name: organization.name,
          address: organization.address
        },
        timeStr: newAppointment.startTime,
        consultationType: newAppointment.type
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error booking appointment" })
  }
})

// PATCH /api/appointments/:id/accept (Sequence: Accept -> DB update -> WebSocket -> Resend to Patient & Doctor)
router.patch("/:id/accept", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "ACCEPTED", updatedAt: new Date() },
      { new: true }
    ).populate("doctorId").populate("organizationId")

    if (!apt) {
      res.status(404).json({ success: false, message: "Appointment not found." })
      return
    }

    const doctorName = (apt.doctorId as any)?.name || "Dr. Specialist"
    const organizationName = (apt.organizationId as any)?.name || "Healthcare Clinic"
    const patientName = apt.patientName || "Patient"

    // 1. Create In-App Notification & WebSocket for Patient
    const acceptMsg = `Your appointment with ${doctorName} on ${apt.date} at ${apt.startTime} has been ACCEPTED & confirmed!`
    await Notification.create({
      userId: apt.patientUserId,
      type: "appointment",
      title: "✅ Appointment Accepted",
      message: acceptMsg,
      relatedAppointmentId: apt._id
    })
    emitToUser(apt.patientUserId.toString(), "new-notification", {
      title: "✅ Appointment Accepted",
      message: acceptMsg,
      appointmentId: apt._id,
      status: "ACCEPTED"
    })
    emitToUser(apt.patientUserId.toString(), "appointment-status-changed", {
      status: "ACCEPTED",
      appointmentId: apt._id,
      appointment: apt
    })

    // 2. Fetch User Emails for Resend Delivery
    try {
      const patientUser = await User.findById(apt.patientUserId).lean()
      const doctorDoc = apt.doctorId as any
      const doctorUser = doctorDoc?.userId ? await User.findById(doctorDoc.userId).lean() : null

      // Send Resend Confirmation Email to Patient
      if (patientUser?.email) {
        await sendAppointmentAcceptedEmailToPatient({
          to: patientUser.email,
          patientName,
          doctorName,
          organizationName,
          date: apt.date,
          timeStr: apt.startTime,
          consultationType: apt.type,
          telemedicineRoomId: apt.telemedicineRoomId
        })
      }

      // Send Resend Confirmation Email to Doctor
      const doctorEmail = doctorUser?.email || (doctorDoc as any)?.contact?.email
      if (doctorEmail) {
        await sendAppointmentAcceptedEmailToDoctor({
          to: doctorEmail,
          doctorName,
          patientName,
          organizationName,
          date: apt.date,
          timeStr: apt.startTime,
          consultationType: apt.type,
          notes: apt.notes
        })
      }
    } catch (emailErr) {
      console.warn("⚠️ Non-blocking email dispatch warning:", emailErr)
    }

    res.status(200).json({ success: true, message: "Appointment accepted and confirmation sent.", data: apt })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error accepting appointment" })
  }
})

// PATCH /api/appointments/:id/status (Universal Status Updater)
router.patch("/:id/status", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, cancellationReason } = req.body
    const updatePayload: any = { status, updatedAt: new Date() }
    if (cancellationReason) updatePayload.cancellationReason = cancellationReason

    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    ).populate("doctorId").populate("organizationId")

    if (!apt) {
      res.status(404).json({ success: false, message: "Appointment not found." })
      return
    }

    const doctorName = (apt.doctorId as any)?.name || "Dr. Specialist"
    const organizationName = (apt.organizationId as any)?.name || "Healthcare Clinic"
    const patientName = apt.patientName || "Patient"

    // If status is ACCEPTED or CONFIRMED, dispatch WebSocket & Resend emails
    if (status === "ACCEPTED" || status === "CONFIRMED") {
      emitToUser(apt.patientUserId.toString(), "appointment-status-changed", {
        status: "ACCEPTED",
        appointmentId: apt._id,
        appointment: apt
      })
      emitToUser(apt.patientUserId.toString(), "new-notification", {
        title: "✅ Appointment Accepted",
        message: `Your appointment with ${doctorName} on ${apt.date} at ${apt.startTime} is confirmed!`,
        appointmentId: apt._id
      })

      try {
        const patientUser = await User.findById(apt.patientUserId).lean()
        const doctorDoc = apt.doctorId as any
        const doctorUser = doctorDoc?.userId ? await User.findById(doctorDoc.userId).lean() : null

        if (patientUser?.email) {
          await sendAppointmentAcceptedEmailToPatient({
            to: patientUser.email,
            patientName,
            doctorName,
            organizationName,
            date: apt.date,
            timeStr: apt.startTime,
            consultationType: apt.type,
            telemedicineRoomId: apt.telemedicineRoomId
          })
        }

        const doctorEmail = doctorUser?.email || (doctorDoc as any)?.contact?.email
        if (doctorEmail) {
          await sendAppointmentAcceptedEmailToDoctor({
            to: doctorEmail,
            doctorName,
            patientName,
            organizationName,
            date: apt.date,
            timeStr: apt.startTime,
            consultationType: apt.type,
            notes: apt.notes
          })
        }
      } catch (e) {
        console.warn("⚠️ Non-blocking email dispatch warning:", e)
      }
    } else {
      emitToUser(apt.patientUserId.toString(), "appointment-status-changed", {
        status,
        appointmentId: apt._id,
        appointment: apt
      })
    }

    res.status(200).json({ success: true, data: apt })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating appointment status" })
  }
})

// PATCH /api/appointments/:id/reject
router.patch("/:id/reject", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body
    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED", cancellationReason: reason || "Declined by provider" },
      { new: true }
    )

    if (!apt) {
      res.status(404).json({ success: false, message: "Appointment not found." })
      return
    }

    const rejectMsg = `Your appointment request for ${apt.date} could not be confirmed. Reason: ${reason || "Unavailable"}.`
    await Notification.create({
      userId: apt.patientUserId,
      type: "appointment",
      title: "Appointment Declined",
      message: rejectMsg,
      relatedAppointmentId: apt._id
    })
    emitToUser(apt.patientUserId.toString(), "new-notification", {
      title: "Appointment Declined",
      message: rejectMsg,
      appointmentId: apt._id
    })
    emitToUser(apt.patientUserId.toString(), "appointment-status-changed", { status: "REJECTED", appointmentId: apt._id })

    res.status(200).json({ success: true, message: "Appointment rejected.", data: apt })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error rejecting appointment" })
  }
})

// PATCH /api/appointments/:id/cancel
router.patch("/:id/cancel", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body
    const user = req.user!
    const cancelledBy = user.role === "PATIENT" ? "Patient" : "Doctor"
    const newStatus = user.role === "PATIENT" ? "CANCELLED_BY_PATIENT" : "CANCELLED_BY_DOCTOR"

    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: newStatus,
        cancellationReason: reason || "Cancelled by user",
        cancelledBy
      },
      { new: true }
    ).populate("doctorId")

    if (!apt) {
      res.status(404).json({ success: false, message: "Appointment not found." })
      return
    }

    const cancelMsg = `Appointment for ${apt.date} was cancelled (${reason || "No reason specified"}).`
    // Notify the other party
    const targetUserId = user.role === "PATIENT" ? (apt.doctorId as any)?.userId : apt.patientUserId
    if (targetUserId) {
      await Notification.create({
        userId: targetUserId,
        type: "appointment",
        title: "Appointment Cancelled",
        message: cancelMsg,
        relatedAppointmentId: apt._id
      })
      emitToUser(targetUserId.toString(), "new-notification", {
        title: "Appointment Cancelled",
        message: cancelMsg,
        appointmentId: apt._id
      })
      emitToUser(targetUserId.toString(), "appointment-status-changed", { status: newStatus, appointmentId: apt._id })
    }

    res.status(200).json({ success: true, message: "Appointment cancelled and time slot released.", data: apt })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error cancelling appointment" })
  }
})

// PATCH /api/appointments/:id/complete (Unlocks Verified Review)
router.patch("/:id/complete", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "COMPLETED", attendanceStatus: "YES" },
      { new: true }
    )

    if (!apt) {
      res.status(404).json({ success: false, message: "Appointment not found." })
      return
    }

    // Notify patient that appointment is complete and review is unlocked
    const completeMsg = `Your consultation is complete. You can now leave a verified review.`
    await Notification.create({
      userId: apt.patientUserId,
      type: "review",
      title: "Consultation Complete",
      message: completeMsg,
      relatedAppointmentId: apt._id
    })
    emitToUser(apt.patientUserId.toString(), "new-notification", {
      title: "Consultation Complete",
      message: completeMsg,
      appointmentId: apt._id
    })
    emitToUser(apt.patientUserId.toString(), "appointment-status-changed", { status: "COMPLETED", appointmentId: apt._id })

    res.status(200).json({ success: true, message: "Appointment completed successfully.", data: apt })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error completing appointment" })
  }
})

// PATCH /api/appointments/:id/attendance
router.patch("/:id/attendance", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attendance } = req.body // "YES" | "NO"
    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { attendanceStatus: attendance },
      { new: true }
    )
    res.status(200).json({ success: true, data: apt })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating attendance" })
  }
})

export default router
