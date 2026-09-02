import { Router, Response } from "express"
import { Schedule } from "../models/Schedule.js"
import { Doctor } from "../models/Doctor.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

// GET /api/schedules/doctor/:doctorId
router.get("/doctor/:doctorId", async (req, res): Promise<void> => {
  try {
    const { doctorId } = req.params
    let schedule = await Schedule.findOne({ doctorId })

    if (!schedule) {
      const doctor = await Doctor.findById(doctorId)
      if (doctor) {
        schedule = await Schedule.create({
          doctorId: doctor._id,
          organizationId: doctor.organizationId,
          workingDays: doctor.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          workingHours: doctor.workingHours || { start: "09:00 AM", end: "05:00 PM" },
          slotDurationMinutes: doctor.slotDurationMinutes || 30
        })
      }
    }

    res.status(200).json({ success: true, data: schedule })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching schedule" })
  }
})

// PUT /api/schedules/doctor/:doctorId (Update working hours / breaks)
router.put("/doctor/:doctorId", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params
    const updated = await Schedule.findOneAndUpdate({ doctorId }, req.body, { new: true, upsert: true })
    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating schedule" })
  }
})

export default router
