import { Router, Request, Response } from "express"
import { Doctor } from "../models/Doctor.js"
import { User } from "../models/User.js"
import { Organization } from "../models/Organization.js"
import { Appointment } from "../models/Appointment.js"
import { Schedule } from "../models/Schedule.js"
import { Review } from "../models/Review.js"
import { Patient } from "../models/Patient.js"
import { MedicalCase } from "../models/MedicalCase.js"
import { Allergy } from "../models/Allergy.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"
import { cacheMiddleware, clearCache } from "../middleware/cache.js"

const router = Router()

// Helper to generate slots for a day
const generateTimeSlots = (startStr: string, endStr: string, intervalMin: number = 30): string[] => {
  const slots: string[] = []
  // Parse start and end time (e.g. "09:00 AM" or "09:00")
  const parseTime = (time: string): number => {
    const isPM = time.includes("PM")
    const isAM = time.includes("AM")
    const clean = time.replace(/[APM ]/g, "")
    const [h, m] = clean.split(":").map(Number)
    let hours = h
    if (isPM && hours < 12) hours += 12
    if (isAM && hours === 12) hours = 0
    return hours * 60 + (m || 0)
  }

  const formatMinutes = (totalMin: number): string => {
    let hours = Math.floor(totalMin / 60)
    const mins = totalMin % 60
    const suffix = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 === 0 ? 12 : hours % 12
    return `${displayHours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${suffix}`
  }

  const startMin = parseTime(startStr || "09:00 AM")
  const endMin = parseTime(endStr || "05:00 PM")

  for (let m = startMin; m < endMin; m += intervalMin) {
    slots.push(formatMinutes(m))
  }

  return slots
}

// GET /api/doctors
router.get("/", cacheMiddleware(30), async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialization, organizationId, search, city } = req.query

    const filter: any = { active: true }

    if (specialization && typeof specialization === "string" && specialization !== "All") {
      filter.specialization = { $regex: new RegExp(`^${specialization.trim()}$`, "i") }
    }

    if (organizationId && typeof organizationId === "string") {
      filter.organizationId = organizationId
    }

    if (search && typeof search === "string" && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { specialization: { $regex: search.trim(), $options: "i" } }
      ]
    }

    let doctors = await Doctor.find(filter).populate("organizationId").lean()

    if (city && typeof city === "string" && city.trim()) {
      doctors = doctors.filter((doc: any) => 
        doc.organizationId?.city?.toLowerCase() === city.trim().toLowerCase()
      )
    }

    const formatted = doctors.map((d: any) => ({
      ...d,
      id: d._id.toString(),
      organization: d.organizationId ? {
        id: d.organizationId._id.toString(),
        name: d.organizationId.name,
        city: d.organizationId.city,
        address: d.organizationId.address
      } : undefined
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching doctors" })
  }
})

// GET /api/doctors/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("organizationId").lean()
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found." })
      return
    }

    const reviews = await Review.find({ doctorId: doctor._id }).sort({ createdAt: -1 }).limit(10).lean()

    res.status(200).json({
      success: true,
      data: {
        ...doctor,
        id: doctor._id.toString(),
        organization: doctor.organizationId,
        reviews
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching doctor details" })
  }
})

// GET /api/doctors/:id/available-slots (Full MongoDB Schedule Integration & Double-Booking Prevention)
router.get("/:id/available-slots", async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = req.params.id
    const dateStr = (req.query.date as string) || new Date().toISOString().split("T")[0]

    let doctor: any = null
    try {
      doctor = await Doctor.findById(doctorId)
    } catch {}
    if (!doctor) {
      doctor = await Doctor.findOne({ active: true })
    }

    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" })
      return
    }

    const schedule = await Schedule.findOne({ doctorId: doctor._id }).lean()

    // 1. Check Leaves in MongoDB
    const leaves = schedule?.leaveDates || schedule?.config?.leaves || []
    const leaveRanges = schedule?.leaveRanges || schedule?.config?.leaveRanges || []
    const isOnLeave = leaves.includes(dateStr) || leaveRanges.some((r: any) => dateStr >= r.start && dateStr <= r.end)

    if (isOnLeave) {
      res.status(200).json({
        success: true,
        date: dateStr,
        doctorId,
        totalSlots: 0,
        availableCount: 0,
        isOnLeave: true,
        isAvailable: false,
        message: "Doctor is on leave on this date.",
        slots: []
      })
      return
    }

    // 2. Check Working Days in MongoDB
    const dayOfWeek = new Date(dateStr).getDay()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayKey = dayNames[dayOfWeek]
    const workingDays = schedule?.workingDays || doctor?.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const isWorkingDay = workingDays.map((d: string) => d.toLowerCase()).includes(dayKey.toLowerCase())

    if (!isWorkingDay) {
      res.status(200).json({
        success: true,
        date: dateStr,
        doctorId,
        totalSlots: 0,
        availableCount: 0,
        isOffDay: true,
        isAvailable: false,
        message: "Doctor is not taking appointments on this day.",
        slots: []
      })
      return
    }

    // 3. Determine Working Hours & Slot Duration
    let start = schedule?.workingHours?.start || doctor?.workingHours?.start || "09:00 AM"
    let end = schedule?.workingHours?.end || doctor?.workingHours?.end || "05:00 PM"

    if (schedule?.dayHours && schedule.dayHours[dayKey.toLowerCase()]) {
      start = schedule.dayHours[dayKey.toLowerCase()].start
      end = schedule.dayHours[dayKey.toLowerCase()].end
    }

    if (schedule?.dateOverrides) {
      const override = schedule.dateOverrides.find((o: any) => o.date === dateStr)
      if (override) {
        start = override.start
        end = override.end
      }
    }

    const interval = schedule?.slotDurationMinutes || doctor?.slotDurationMinutes || 30
    const allSlots = generateTimeSlots(start, end, interval)

    // 4. Breaks and Unavailability Blocks
    const breaks = schedule?.breakTimes || schedule?.config?.breaks || []
    const unavailability = schedule?.unavailability || schedule?.config?.unavailability || []

    const parseMinutes = (time: string): number => {
      const isPM = time.includes("PM")
      const isAM = time.includes("AM")
      const clean = time.replace(/[APM ]/g, "")
      const [h, m] = clean.split(":").map(Number)
      let hours = h
      if (isPM && hours < 12) hours += 12
      if (isAM && hours === 12) hours = 0
      return hours * 60 + (m || 0)
    }

    const isInRange = (slotTime: string, rStart: string, rEnd: string): boolean => {
      if (!rStart || !rEnd) return false
      const t = parseMinutes(slotTime)
      const s = parseMinutes(rStart)
      const e = parseMinutes(rEnd)
      return t >= s && t < e
    }

    // 5. Booked Appointments from MongoDB
    const docQuery: any[] = [{ doctorId: doctorId }, { doctorId: doctor._id }]
    if (doctor.userId) docQuery.push({ doctorId: doctor.userId })

    const bookedAppointments = await Appointment.find({
      $or: docQuery,
      date: dateStr,
      status: { $in: ["PENDING", "ACCEPTED", "CONFIRMED", "COMPLETED"] }
    }).select("startTime").lean()

    const bookedTimes = new Set(bookedAppointments.map(a => a.startTime))

    // 6. Map slots with full state
    const slotDetails = allSlots.map(timeStr => {
      const isBooked = bookedTimes.has(timeStr)
      const isBreak = breaks.some((b: any) => isInRange(timeStr, b.start, b.end))
      const isUnavailable = unavailability.some((u: any) => isInRange(timeStr, u.start, u.end))

      let available = true
      let reason: string | undefined

      if (isBooked) {
        available = false
        reason = "Booked"
      } else if (isBreak) {
        available = false
        reason = "Break"
      } else if (isUnavailable) {
        available = false
        reason = "Unavailable"
      }

      return {
        time: timeStr,
        available,
        reason
      }
    })

    res.status(200).json({
      success: true,
      date: dateStr,
      doctorId: doctor._id.toString(),
      totalSlots: slotDetails.length,
      availableCount: slotDetails.filter(s => s.available).length,
      isAvailable: slotDetails.some(s => s.available),
      slots: slotDetails
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error generating available slots" })
  }
})

// GET /api/doctors/me/schedule
router.get("/me/schedule", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user!._id })
    if (!doctor) {
      doctor = await Doctor.findOne({ active: true })
    }
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found" })
      return
    }

    const schedule = await Schedule.findOne({ doctorId: doctor._id }).lean()

    if (schedule && schedule.config) {
      res.status(200).json({ success: true, data: schedule.config })
      return
    }

    const workingDaysMap: Record<string, boolean> = {
      monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
    }
    ;(doctor.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]).forEach(d => {
      workingDaysMap[d.toLowerCase()] = true
    })

    const defaultConfig = {
      doctorId: doctor._id.toString(),
      workingDays: workingDaysMap,
      dayHours: schedule?.dayHours || {
        saturday: { start: "09:00", end: "13:00" }
      },
      defaultHours: {
        start: doctor.workingHours?.start || "09:00",
        end: doctor.workingHours?.end || "17:00"
      },
      appointmentDurationMinutes: doctor.slotDurationMinutes || 30,
      breaks: schedule?.breakTimes || [
        { start: "13:00", end: "14:00", label: "Lunch break" }
      ],
      unavailability: schedule?.unavailability || [],
      leaves: schedule?.leaveDates || [],
      leaveRanges: schedule?.leaveRanges || [],
      dateOverrides: schedule?.dateOverrides || []
    }

    res.status(200).json({ success: true, data: defaultConfig })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error loading schedule" })
  }
})

// PUT /api/doctors/me/schedule
router.put("/me/schedule", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user!._id })
    if (!doctor) {
      doctor = await Doctor.findOne({ active: true })
    }
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found" })
      return
    }

    const config = req.body

    const activeWorkingDays: string[] = []
    const dayLabels: Record<string, string> = {
      monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
      thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday"
    }
    if (config.workingDays) {
      Object.entries(config.workingDays).forEach(([k, v]) => {
        if (v && dayLabels[k.toLowerCase()]) activeWorkingDays.push(dayLabels[k.toLowerCase()])
      })
    }

    const updatedSchedule = await Schedule.findOneAndUpdate(
      { doctorId: doctor._id },
      {
        $set: {
          doctorId: doctor._id,
          organizationId: doctor.organizationId,
          workingDays: activeWorkingDays.length > 0 ? activeWorkingDays : doctor.workingDays,
          workingHours: {
            start: config.defaultHours?.start || "09:00",
            end: config.defaultHours?.end || "17:00"
          },
          slotDurationMinutes: config.appointmentDurationMinutes || 30,
          breakTimes: config.breaks || [],
          unavailability: config.unavailability || [],
          leaveDates: config.leaves || [],
          leaveRanges: config.leaveRanges || [],
          dayHours: config.dayHours || {},
          dateOverrides: config.dateOverrides || [],
          config: config
        }
      },
      { upsert: true, new: true }
    )

    await Doctor.findByIdAndUpdate(doctor._id, {
      workingDays: activeWorkingDays.length > 0 ? activeWorkingDays : doctor.workingDays,
      workingHours: {
        start: config.defaultHours?.start || "09:00",
        end: config.defaultHours?.end || "17:00"
      },
      slotDurationMinutes: config.appointmentDurationMinutes || 30
    })

    res.status(200).json({ success: true, message: "Schedule saved successfully", data: updatedSchedule })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error saving schedule" })
  }
})
router.get("/me/dashboard", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!._id })
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found for this user." })
      return
    }

    const todayStr = new Date().toISOString().split("T")[0]

    const todayAppointments = await Appointment.find({ doctorId: doctor._id, date: todayStr }).lean()
    const pendingAppointments = await Appointment.find({ doctorId: doctor._id, status: "PENDING" }).lean()
    const upcomingAppointments = await Appointment.find({
      doctorId: doctor._id,
      date: { $gte: todayStr },
      status: { $in: ["ACCEPTED", "CONFIRMED"] }
    }).lean()

    const reviews = await Review.find({ doctorId: doctor._id }).sort({ createdAt: -1 }).limit(5).lean()

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id.toString(),
          name: doctor.name,
          specialization: doctor.specialization,
          rating: doctor.rating,
          reviewCount: doctor.reviewCount
        },
        stats: {
          todayCount: todayAppointments.length,
          pendingCount: pendingAppointments.length,
          upcomingCount: upcomingAppointments.length,
          rating: doctor.rating
        },
        todayAppointments,
        pendingAppointments,
        recentReviews: reviews
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching doctor dashboard" })
  }
})

// GET /api/doctors/me/profile
router.get("/me/profile", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user!._id }).populate("organizationId").populate("userId")
    if (!doctor) {
      doctor = await Doctor.findOne({ active: true }).populate("organizationId").populate("userId")
    }

    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found" })
      return
    }

    const u = doctor.userId as any
    const org = doctor.organizationId as any

    res.status(200).json({
      success: true,
      data: {
        id: doctor._id.toString(),
        name: doctor.name || u?.name || "Doctor",
        specialization: doctor.specialization,
        experienceYears: doctor.experienceYears || 10,
        organizationName: org?.name || "CityCare Clinic, Surat",
        email: u?.email || req.user?.email || "dr.patel@citycare.example",
        phone: u?.phone || req.user?.phone || "+91 1234567890",
        rating: doctor.rating || 4.8,
        reviewCount: doctor.reviewCount || 0,
        consultationFee: doctor.consultationFee || 500,
        telemedicineFee: doctor.telemedicineFee || 400,
        bio: doctor.bio
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching profile" })
  }
})

// PUT /api/doctors/me/profile (Edit ONLY email and phone number)
router.put("/me/profile", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body

    const user = req.user!
    let doctor = await Doctor.findOne({ userId: user._id })
    if (!doctor) {
      doctor = await Doctor.findOne({ active: true })
    }

    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found" })
      return
    }

    const updateUserData: any = {}
    if (email !== undefined) updateUserData.email = email.trim().toLowerCase()
    if (phone !== undefined) updateUserData.phone = phone.trim()

    await User.findByIdAndUpdate(user._id, updateUserData)
    if (doctor.userId && doctor.userId.toString() !== user._id.toString()) {
      await User.findByIdAndUpdate(doctor.userId, updateUserData)
    }

    res.status(200).json({
      success: true,
      message: "Doctor contact profile updated successfully",
      data: {
        email: updateUserData.email || user.email,
        phone: updateUserData.phone || user.phone
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating doctor profile" })
  }
})

// GET /api/doctors/:id/patients (Doctor's Patients with authentic clinical history)
router.get("/:id/patients", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paramId = req.params.id
    let doctor: any = null

    if (paramId === "me" || req.user?.role === "DOCTOR") {
      doctor = await Doctor.findOne({ userId: req.user!._id })
    }
    if (!doctor) {
      try {
        doctor = await Doctor.findById(paramId)
      } catch {}
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ active: true })
    }

    const validDocIds: any[] = []
    if (doctor?._id) validDocIds.push(doctor._id)
    if (doctor?.userId) validDocIds.push(doctor.userId)
    if (paramId && paramId !== "me" && /^[0-9a-fA-F]{24}$/.test(paramId)) {
      validDocIds.push(paramId)
    }

    // Find all unique patients who have booked an appointment with this doctor
    const apptQuery = validDocIds.length > 0 ? { doctorId: { $in: validDocIds } } : {}
    const appointments = await Appointment.find(apptQuery).populate("patientUserId").sort({ date: -1 }).lean()

    const patientMap = new Map<string, any>()

    for (const apt of appointments) {
      const patientUser = apt.patientUserId as any
      const patientKey = patientUser?._id?.toString() || apt.patientName || apt.patientPhone || "unknown_patient"

      if (!patientMap.has(patientKey)) {
        let patientDoc: any = null
        let medicalCases: any[] = []
        let allergies: any[] = []

        if (patientUser?._id) {
          patientDoc = await Patient.findOne({ userId: patientUser._id }).lean()
          const pQuery: any[] = [{ patientUserId: patientUser._id }]
          if (patientDoc?._id) pQuery.push({ patientId: patientDoc._id })

          medicalCases = await MedicalCase.find({ $or: pQuery }).sort({ date: -1 }).lean().catch(() => [])
          allergies = await Allergy.find({ $or: pQuery }).lean().catch(() => [])
        }

        const patientCode = patientDoc?.patientId || `PAT-${patientKey.substring(0, 6).toUpperCase()}`

        patientMap.set(patientKey, {
          id: patientDoc?._id?.toString() || patientUser?._id?.toString() || patientKey,
          patientId: patientCode,
          name: patientUser?.name || apt.patientName || "Patient",
          email: patientUser?.email || "",
          phone: patientUser?.phone || apt.patientPhone || "",
          qrCodeToken: patientDoc?.qrCodeToken,
          allergies: allergies.map(a => `${a.allergyName} (${a.severity})`),
          lastVisit: apt.date,
          activeCasesCount: medicalCases.filter(c => c.status === "active").length,
          totalAppointments: appointments.filter(a => {
            const u = a.patientUserId as any
            return (u?._id?.toString() === patientUser?._id?.toString()) || (a.patientName === apt.patientName)
          }).length,
          medicalCases
        })
      }
    }

    const searchFilter = (req.query.search as string) || (req.query.query as string) || ""

    // 2. Also populate all registered patients in the database
    const allRegisteredPatients = await Patient.find().populate("userId").lean().catch(() => [])

    for (const p of allRegisteredPatients) {
      const u = p.userId as any
      const patientKey = u?._id?.toString() || p._id.toString()

      if (!patientMap.has(patientKey)) {
        const pQuery: any[] = [{ patientId: p._id }]
        if (u?._id) pQuery.push({ patientUserId: u._id })
        else if (p.userId && /^[0-9a-fA-F]{24}$/.test(p.userId.toString())) pQuery.push({ patientUserId: p.userId })

        const [medicalCases, allergies, patientApts] = await Promise.all([
          MedicalCase.find({ $or: pQuery }).sort({ date: -1 }).lean().catch(() => []),
          Allergy.find({ $or: pQuery }).lean().catch(() => []),
          Appointment.find({ $or: pQuery }).sort({ date: -1 }).lean().catch(() => [])
        ])

        const lastApt = patientApts[0]
        const upcomingApt = patientApts.find(a => a.date >= new Date().toISOString().split("T")[0] && (a.status === "CONFIRMED" || a.status === "ACCEPTED" || a.status === "PENDING"))

        patientMap.set(patientKey, {
          id: p._id.toString(),
          patientId: p.patientId || `PAT-${patientKey.substring(0, 6).toUpperCase()}`,
          name: p.name || u?.name || "Patient",
          email: p.email || u?.email || "",
          phone: p.phone || u?.phone || "",
          qrCodeToken: p.qrCodeToken,
          allergies: allergies.map(a => `${a.allergyName} (${a.severity})`),
          lastVisit: lastApt?.date,
          nextAppointmentDate: upcomingApt?.date,
          activeCasesCount: medicalCases.filter(c => c.status === "active").length,
          totalAppointments: patientApts.length,
          medicalCases
        })
      }
    }

    let list = Array.from(patientMap.values())

    if (searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase()
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.patientId && p.patientId.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
      )
    }

    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching patients list" })
  }
})

export default router
