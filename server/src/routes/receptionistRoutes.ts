import { Router, Response } from "express"
import bcrypt from "bcryptjs"
import { Receptionist } from "../models/Receptionist.js"
import { User } from "../models/User.js"
import { Appointment } from "../models/Appointment.js"
import { Doctor } from "../models/Doctor.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

// GET /api/receptionists/organization/:orgId
router.get("/organization/:orgId", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const receptionists = await Receptionist.find({ organizationId: req.params.orgId }).lean()
    res.status(200).json({ success: true, count: receptionists.length, data: receptionists })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching receptionists" })
  }
})

// POST /api/receptionists (Doctor/Org creating receptionist account - Section 83/98 of PDF)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organizationId, name, email, phone, password, permissions } = req.body

    if (!organizationId || !name || !email || !password) {
      res.status(400).json({ success: false, message: "Organization ID, name, email, and password are required." })
      return
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      res.status(400).json({ success: false, message: "A user with this email already exists." })
      return
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: "RECEPTIONIST",
      accountStatus: "active"
    })

    const receptionist = await Receptionist.create({
      userId: user._id,
      organizationId,
      name,
      email: email.toLowerCase(),
      phone,
      permissions: permissions || {
        manageAppointments: true,
        manageSchedule: true,
        viewPatientBasicInfo: true,
        manageOrgDetails: false
      },
      status: "active"
    })

    res.status(201).json({
      success: true,
      message: "Receptionist account created successfully.",
      data: { ...receptionist.toObject(), id: receptionist._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error creating receptionist" })
  }
})

// PATCH /api/receptionists/:id/permissions
router.patch("/:id/permissions", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { permissions, status } = req.body
    const updated = await Receptionist.findByIdAndUpdate(
      req.params.id,
      { ...(permissions && { permissions }), ...(status && { status }) },
      { new: true }
    )
    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating receptionist permissions" })
  }
})

// GET /api/receptionists/appointments (Receptionist Organization Queue)
router.get("/appointments", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const rec = await Receptionist.findOne({ userId: user._id })

    if (!rec && user.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Only receptionists can access this queue." })
      return
    }

    const orgId = rec ? rec.organizationId : req.query.organizationId
    const appointments = await Appointment.find({ organizationId: orgId })
      .populate("doctorId", "name specialization avatar")
      .sort({ date: -1, startTime: 1 })
      .lean()

    const formatted = appointments.map((a: any) => ({
      ...a,
      id: a._id.toString(),
      doctor: a.doctorId,
      timeStr: a.startTime,
      consultationType: a.type
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching receptionist appointments" })
  }
})

export default router
