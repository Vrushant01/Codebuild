import { Router, Response } from "express"
import { MedicalCase } from "../models/MedicalCase.js"
import { Doctor } from "../models/Doctor.js"
import { Patient } from "../models/Patient.js"
import { MedicineSchedule } from "../models/MedicineSchedule.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

// GET /api/medical-cases
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { patientId, doctorId, status } = req.query

    const filter: any = {}
    if (user.role === "PATIENT") {
      const patient = await Patient.findOne({ userId: user._id })
      if (patient) {
        filter.$or = [{ patientId: patient._id }, { patientUserId: user._id }]
      } else {
        filter.patientUserId = user._id
      }
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
    }

    if (doctorId) {
      filter.doctorId = doctorId
    }

    if (status && typeof status === "string") {
      filter.status = status
    }

    const cases = await MedicalCase.find(filter)
      .populate("doctorId")
      .populate("patientId")
      .sort({ date: -1 })
      .lean()

    const formatted = cases.map((c: any) => ({
      ...c,
      id: c._id.toString(),
      doctor: c.doctorId ? {
        id: c.doctorId._id.toString(),
        name: c.doctorId.name,
        specialization: c.doctorId.specialization
      } : undefined
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching medical cases" })
  }
})

// POST /api/medical-cases (Doctor diagnosing & creating clinical record)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const {
      patientId,
      appointmentId,
      title,
      symptoms = [],
      diagnosis,
      treatment,
      notes,
      prescribedMedicines = [],
      status = "active"
    } = req.body

    if (!patientId || !title || !diagnosis) {
      res.status(400).json({ success: false, message: "Patient ID, case title, and diagnosis are required." })
      return
    }

    const doctor = await Doctor.findOne({ userId: user._id })
    if (!doctor && user.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Only licensed doctors can add medical case records." })
      return
    }

    const todayStr = new Date().toISOString().split("T")[0]

    const newCase = await MedicalCase.create({
      patientId,
      doctorId: doctor?._id,
      organizationId: doctor?.organizationId,
      appointmentId,
      title,
      symptoms,
      diagnosis,
      treatment,
      notes,
      prescribedMedicines,
      status,
      date: todayStr
    })

    // If medicines are prescribed, automatically create MedicineSchedule records for patient
    if (Array.isArray(prescribedMedicines) && prescribedMedicines.length > 0) {
      const patient = await Patient.findById(patientId)
      if (patient) {
        for (const med of prescribedMedicines) {
          await MedicineSchedule.create({
            patientId: patient._id,
            patientUserId: patient.userId,
            doctorId: doctor?._id,
            appointmentId,
            medicineName: med.name,
            dosage: med.dosage,
            frequency: med.frequency || "Twice daily",
            times: ["08:00 AM", "08:00 PM"],
            foodInstruction: "After food",
            startDate: todayStr,
            instructions: med.instructions,
            source: "DOCTOR",
            prescribedBy: doctor?.name,
            status: "active"
          })
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Medical case and prescription saved successfully.",
      data: { ...newCase.toObject(), id: newCase._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error creating medical case" })
  }
})

// PATCH /api/medical-cases/:id
router.patch("/:id", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updated = await MedicalCase.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating medical case" })
  }
})

export default router
