import { Router, Response } from "express"
import { MedicineSchedule } from "../models/MedicineSchedule.js"
import { Patient } from "../models/Patient.js"
import { User } from "../models/User.js"
import { Appointment } from "../models/Appointment.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"
import { sendMedicationReminderEmail } from "../services/emailService.js"

const router = Router()

// GET /api/medicines
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { status, patientId } = req.query

    const filter: any = {}
    if (user.role === "PATIENT") {
      const pDoc = await Patient.findOne({ userId: user._id })
      if (pDoc) {
        filter.$or = [{ patientUserId: user._id }, { patientId: pDoc._id }]
      } else {
        filter.patientUserId = user._id
      }
    } else if (patientId && typeof patientId === "string") {
      const appt = patientId.match(/^[0-9a-fA-F]{24}$/) ? await Appointment.findById(patientId).catch(() => null) : null
      if (appt) {
        const pOr: any[] = []
        if (appt.patientUserId) pOr.push({ patientUserId: appt.patientUserId })
        if (appt.patientId) pOr.push({ patientId: appt.patientId })
        filter.$or = pOr.length > 0 ? pOr : [{ patientUserId: appt.patientUserId }]
      } else {
        const pDoc = await Patient.findOne({
          $or: [
            { patientId: patientId },
            { _id: patientId.match(/^[0-9a-fA-F]{24}$/) ? patientId : undefined },
            { userId: patientId.match(/^[0-9a-fA-F]{24}$/) ? patientId : undefined }
          ].filter(Boolean) as any
        }).lean()

        if (pDoc) {
          filter.$or = [{ patientId: pDoc._id }, { patientUserId: pDoc.userId }]
        } else if (patientId.match(/^[0-9a-fA-F]{24}$/)) {
          filter.$or = [{ patientId: patientId }, { patientUserId: patientId }]
        } else {
          filter.patientId = patientId
        }
      }
    }

    if (status && typeof status === "string") {
      filter.status = status
    }

    const medicines = await MedicineSchedule.find(filter).sort({ createdAt: -1 }).lean()

    const formatted = medicines.map(m => ({
      ...m,
      id: m._id.toString()
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching medicines" })
  }
})

// GET /api/medicines/daily-schedule
router.get("/daily-schedule", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const dateStr = (req.query.date as string) || new Date().toISOString().split("T")[0]

    const activeMeds = await MedicineSchedule.find({
      patientUserId: user._id,
      status: "active"
    }).lean()

    // Build doses for the date
    const doses: any[] = []
    activeMeds.forEach(med => {
      (med.times || ["08:00 AM"]).forEach((timeStr, idx) => {
        const existingLog = med.doseLogs?.find(l => l.date === dateStr && l.scheduledTime === timeStr)
        doses.push({
          id: `${med._id}_${idx}`,
          medicineId: med._id.toString(),
          medicineName: med.medicineName,
          dosage: med.dosage,
          foodInstruction: med.foodInstruction,
          scheduledTime: timeStr,
          status: existingLog?.status || "upcoming",
          takenAt: existingLog?.takenAt,
          instructions: med.instructions
        })
      })
    })

    // Sort by scheduled time
    doses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))

    const stats = {
      total: doses.length,
      taken: doses.filter(d => d.status === "taken").length,
      upcoming: doses.filter(d => d.status === "upcoming").length,
      missed: doses.filter(d => d.status === "missed").length
    }

    res.status(200).json({
      success: true,
      date: dateStr,
      stats,
      doses
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching daily schedule" })
  }
})

// POST /api/medicines (Patient or Doctor adding prescription)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const {
      patientId,
      medicineName,
      dosage,
      frequency = "Twice daily",
      times = ["08:00 AM", "08:00 PM"],
      foodInstruction = "After food",
      startDate,
      endDate,
      instructions,
      reminderEnabled = true,
      prescribedBy
    } = req.body

    if (!medicineName || !dosage) {
      res.status(400).json({ success: false, message: "Medicine name and dosage are required." })
      return
    }

    let targetPatientId = patientId
    let targetUserId = user._id

    if (user.role === "PATIENT") {
      const patient = await Patient.findOne({ userId: user._id })
      targetPatientId = patient?._id
      targetUserId = user._id
    } else {
      // Doctor or Receptionist adding prescription for a patient
      if (patientId && typeof patientId === "string") {
        const [appt, pDoc, uDoc] = await Promise.all([
          Appointment.findById(patientId).catch(() => null),
          Patient.findOne({
            $or: [
              { patientId: patientId },
              { _id: patientId.match(/^[0-9a-fA-F]{24}$/) ? patientId : undefined },
              { userId: patientId.match(/^[0-9a-fA-F]{24}$/) ? patientId : undefined }
            ].filter(Boolean) as any
          }).catch(() => null),
          User.findById(patientId).catch(() => null)
        ])

        if (appt) {
          targetPatientId = appt.patientId
          targetUserId = appt.patientUserId
        } else if (pDoc) {
          targetPatientId = pDoc._id
          targetUserId = pDoc.userId
        } else if (uDoc) {
          targetUserId = uDoc._id
          const p = await Patient.findOne({ userId: uDoc._id })
          targetPatientId = p?._id
        }
      }
    }

    const todayStr = new Date().toISOString().split("T")[0]

    const newMed = await MedicineSchedule.create({
      patientId: targetPatientId,
      patientUserId: targetUserId,
      medicineName,
      dosage,
      frequency,
      times,
      foodInstruction,
      startDate: startDate || todayStr,
      endDate,
      instructions,
      reminderEnabled,
      source: user.role === "DOCTOR" ? "DOCTOR" : "PATIENT",
      prescribedBy: prescribedBy || (user.role === "DOCTOR" ? user.name : undefined),
      status: "active",
      doseLogs: []
    })

    res.status(201).json({
      success: true,
      data: { ...newMed.toObject(), id: newMed._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error adding medicine schedule" })
  }
})

// POST /api/medicines/:id/dose (Record dose taken / missed)
router.post("/:id/dose", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, scheduledTime, status } = req.body // status: "taken" | "missed" | "upcoming"
    const todayStr = new Date().toISOString().split("T")[0]
    const doseDate = date || todayStr

    const med = await MedicineSchedule.findById(req.params.id)
    if (!med) {
      res.status(404).json({ success: false, message: "Medicine not found." })
      return
    }

    // Remove old log for this date & time if present
    med.doseLogs = med.doseLogs.filter(l => !(l.date === doseDate && l.scheduledTime === scheduledTime))

    // Add new log
    med.doseLogs.push({
      date: doseDate,
      scheduledTime,
      status: status || "taken",
      takenAt: status === "taken" ? new Date().toISOString() : undefined
    })

    await med.save()

    res.status(200).json({ success: true, data: med })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error recording dose status" })
  }
})

// PUT /api/medicines/:id (Full or Partial Update)
router.put("/:id", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      medicineName,
      name,
      dosage,
      frequency,
      times,
      foodInstruction,
      startDate,
      endDate,
      instructions,
      reminderEnabled,
      status
    } = req.body

    const updateData: any = {}
    if (medicineName || name) updateData.medicineName = medicineName || name
    if (dosage !== undefined) updateData.dosage = dosage
    if (frequency !== undefined) updateData.frequency = frequency
    if (times !== undefined) updateData.times = times
    if (foodInstruction !== undefined) updateData.foodInstruction = foodInstruction
    if (startDate !== undefined) updateData.startDate = startDate
    if (endDate !== undefined) updateData.endDate = endDate
    if (instructions !== undefined) updateData.instructions = instructions
    if (reminderEnabled !== undefined) updateData.reminderEnabled = reminderEnabled
    if (status !== undefined) updateData.status = status

    const updated = await MedicineSchedule.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!updated) {
      res.status(404).json({ success: false, message: "Medicine not found." })
      return
    }

    res.status(200).json({
      success: true,
      data: { ...updated.toObject(), id: updated._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating medicine" })
  }
})

// PATCH /api/medicines/:id/status
router.patch("/:id/status", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, reminderEnabled } = req.body // "active" | "completed" | "cancelled"
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (reminderEnabled !== undefined) updateData.reminderEnabled = reminderEnabled

    const updated = await MedicineSchedule.findByIdAndUpdate(req.params.id, updateData, { new: true })
    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating medicine status" })
  }
})

// POST /api/medicines/send-email-reminder
router.post("/send-email-reminder", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const {
      medicineId,
      medicineName,
      dosage,
      scheduledTime,
      foodInstruction,
      instructions,
      reminderType,
      targetEmail
    } = req.body

    const userDoc = await User.findById(user._id).lean()
    const recipient = (targetEmail || userDoc?.email || user.email || "").trim()

    if (!recipient) {
      res.status(400).json({ success: false, message: "No registered email found for this user." })
      return
    }

    const emailResult = await sendMedicationReminderEmail({
      to: recipient,
      patientName: userDoc?.name || user.name || "Patient",
      medicineName: medicineName || "Medication",
      dosage: dosage || "1 Dose",
      scheduledTime: scheduledTime || "Now",
      foodInstruction: foodInstruction || "After food",
      instructions,
      reminderType: reminderType || "EXACT_TIME"
    })

    res.status(200).json({
      success: emailResult.success,
      id: emailResult.id,
      message: emailResult.success ? `Reminder email sent to ${recipient} via Resend` : emailResult.error
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error sending email reminder" })
  }
})

// DELETE /api/medicines/:id
router.delete("/:id", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await MedicineSchedule.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: "Medicine permanently deleted" })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error deleting medicine" })
  }
})

export default router
