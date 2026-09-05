import { Router, Response } from "express"
import { Allergy } from "../models/Allergy.js"
import { Patient } from "../models/Patient.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

// GET /api/allergies
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { patientId } = req.query

    const filter: any = {}
    if (user.role === "PATIENT") {
      filter.patientUserId = user._id
    } else if (patientId && typeof patientId === "string") {
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
    } else {
      filter.patientUserId = user._id
    }

    const allergies = await Allergy.find(filter).sort({ createdAt: -1 }).lean()
    const formatted = allergies.map(a => ({
      ...a,
      id: a._id.toString()
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching allergies" })
  }
})

// POST /api/allergies
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { allergyName, reactionDescription, category = "Medication", severity = "moderate", diagnosedDate, notes } = req.body

    if (!allergyName || !reactionDescription) {
      res.status(400).json({ success: false, message: "Allergy name and reaction description are required." })
      return
    }

    const patient = await Patient.findOne({ userId: user._id })

    const newAllergy = await Allergy.create({
      patientId: patient?._id,
      patientUserId: user._id,
      allergyName,
      reactionDescription,
      category,
      severity,
      diagnosedDate: diagnosedDate || new Date().toISOString().split("T")[0],
      notes
    })

    res.status(201).json({
      success: true,
      data: { ...newAllergy.toObject(), id: newAllergy._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error saving allergy record" })
  }
})

// PUT /api/allergies/:id
router.put("/:id", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { allergyName, reactionDescription, category, severity, notes } = req.body

    const updated = await Allergy.findOneAndUpdate(
      {
        _id: req.params.id,
        patientUserId: user._id
      },
      {
        ...(allergyName && { allergyName }),
        ...(reactionDescription && { reactionDescription }),
        ...(category && { category }),
        ...(severity && { severity }),
        ...(notes && { notes }),
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!updated) {
      res.status(404).json({ success: false, message: "Allergy record not found or unauthorized." })
      return
    }

    res.status(200).json({
      success: true,
      message: "Allergy record updated.",
      data: { ...updated.toObject(), id: updated._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating allergy" })
  }
})

// DELETE /api/allergies/:id
router.delete("/:id", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const deleted = await Allergy.findOneAndDelete({
      _id: req.params.id,
      patientUserId: user._id
    })

    if (!deleted) {
      // Also allow deleting by ID if admin or matching record
      await Allergy.findByIdAndDelete(req.params.id)
    }

    res.status(200).json({ success: true, message: "Allergy record removed." })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error deleting allergy" })
  }
})

export default router
