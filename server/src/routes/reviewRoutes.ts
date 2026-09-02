import { Router, Request, Response } from "express"
import { Review } from "../models/Review.js"
import { Appointment } from "../models/Appointment.js"
import { Doctor } from "../models/Doctor.js"
import { Organization } from "../models/Organization.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"
import { clearCache } from "../middleware/cache.js"

const router = Router()

// GET /api/reviews
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, organizationId, patientUserId } = req.query

    const filter: any = {}
    if (doctorId && typeof doctorId === "string") {
      const isHex = /^[0-9a-fA-F]{24}$/.test(doctorId)
      if (isHex) {
        try {
          const docRecord = await Doctor.findOne({ $or: [{ _id: doctorId }, { userId: doctorId }] }).lean()
          if (docRecord) {
            filter.$or = [{ doctorId: docRecord._id }, { doctorId: docRecord.userId }]
          } else {
            filter.doctorId = doctorId
          }
        } catch {
          filter.doctorId = doctorId
        }
      } else {
        // Non-hex ID (like mock doctor:1)
        res.status(200).json({ success: true, count: 0, data: [] })
        return
      }
    }

    if (organizationId) filter.organizationId = organizationId
    if (patientUserId) filter.patientUserId = patientUserId

    const reviews = await Review.find(filter)
      .populate("doctorId", "name specialization")
      .populate("organizationId", "name city")
      .sort({ createdAt: -1 })
      .lean()

    const formatted = reviews.map((r: any) => ({
      ...r,
      id: r._id.toString(),
      author: r.patientName,
      date: new Date(r.createdAt).toISOString().split("T")[0]
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching reviews" })
  }
})

// POST /api/reviews (Rule 2 & Section 51/53: Anti-Fake Verified Review Check)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { appointmentId, rating, comment } = req.body

    if (!appointmentId || !rating || !comment) {
      res.status(400).json({
        success: false,
        message: "Appointment ID, rating (1-5), and written comment are required."
      })
      return
    }

    // 1. Verify Appointment existence & patient ownership
    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment record not found." })
      return
    }

    if (appointment.patientUserId.toString() !== user._id.toString()) {
      res.status(403).json({
        success: false,
        message: "You can only submit reviews for your own appointments."
      })
      return
    }

    // 2. Anti-Fake Check: Appointment MUST be COMPLETED
    if (appointment.status !== "COMPLETED") {
      res.status(400).json({
        success: false,
        message: "Reviews can only be submitted for completed consultations to prevent fake reviews."
      })
      return
    }

    // 3. Duplicate check: Only 1 review per appointment
    const existingReview = await Review.findOne({ appointmentId })
    if (existingReview) {
      res.status(409).json({
        success: false,
        message: "You have already submitted a review for this consultation."
      })
      return
    }

    // 4. Create Verified Review
    const newReview = await Review.create({
      patientUserId: user._id,
      patientName: user.name,
      appointmentId,
      doctorId: appointment.doctorId,
      organizationId: appointment.organizationId,
      rating: Number(rating),
      comment,
      verified: true
    })

    // 5. Recalculate Doctor Average Rating
    const allDoctorReviews = await Review.find({ doctorId: appointment.doctorId })
    const avgDoctorRating =
      allDoctorReviews.reduce((sum, r) => sum + r.rating, 0) / allDoctorReviews.length
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      rating: Math.round(avgDoctorRating * 10) / 10,
      reviewCount: allDoctorReviews.length
    })

    // 6. Recalculate Organization Average Rating
    const allOrgReviews = await Review.find({ organizationId: appointment.organizationId })
    const avgOrgRating =
      allOrgReviews.reduce((sum, r) => sum + r.rating, 0) / allOrgReviews.length
    await Organization.findByIdAndUpdate(appointment.organizationId, {
      rating: Math.round(avgOrgRating * 10) / 10,
      reviewCount: allOrgReviews.length
    })

    clearCache("organizations")
    clearCache("doctors")

    res.status(201).json({
      success: true,
      message: "Verified review submitted successfully.",
      data: { ...newReview.toObject(), id: newReview._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error submitting review" })
  }
})

export default router
