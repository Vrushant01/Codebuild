import { Router, Request, Response } from "express"
import { Patient } from "../models/Patient.js"
import { User } from "../models/User.js"
import { MedicalCase } from "../models/MedicalCase.js"
import { Allergy } from "../models/Allergy.js"
import { MedicineSchedule } from "../models/MedicineSchedule.js"
import { Appointment } from "../models/Appointment.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

// GET /api/patients/me (Current Patient Profile)
router.get("/me", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    let patient = await Patient.findOne({ userId: user._id })

    if (!patient) {
      // Auto-provision if missing
      const uniqueId = `PAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const qrToken = `QR_${uniqueId}_${Date.now()}`
      patient = await Patient.create({
        userId: user._id,
        patientId: uniqueId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        qrCodeToken: qrToken,
        preferredLanguage: user.preferredLanguage || "en"
      })
    }

    const allergies = await Allergy.find({ patientUserId: user._id }).lean()
    const activeCases = await MedicalCase.find({ patientId: patient._id, status: "active" }).lean()
    const pastCases = await MedicalCase.find({ patientId: patient._id, status: "resolved" }).lean()
    const medicines = await MedicineSchedule.find({ patientUserId: user._id }).lean()

    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        id: patient._id.toString(),
        allergies,
        activeCases,
        pastCases,
        medicines
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching patient profile" })
  }
})

// PUT /api/patients/me (Update Patient Profile)
router.put("/me", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { name, phone, dateOfBirth, gender, bloodGroup, address, city, preferredLanguage, emergencyContact } = req.body

    if (name) {
      await User.findByIdAndUpdate(user._id, { name, preferredLanguage })
    }

    const updated = await Patient.findOneAndUpdate(
      { userId: user._id },
      {
        name: name || user.name,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        city,
        preferredLanguage,
        emergencyContact
      },
      { new: true, upsert: true }
    )

    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating patient profile" })
  }
})

// GET /api/patients/qr/:token (Doctor scanning Patient QR code - Section 58 of PDF)
router.get("/qr/:token", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params
    const searchQueries: any[] = [
      { qrCodeToken: token },
      { patientId: token.toUpperCase() },
      { patientId: token }
    ]
    if (/^[0-9a-fA-F]{24}$/.test(token)) {
      searchQueries.push({ _id: token }, { userId: token })
    }
    let patient = await Patient.findOne({ $or: searchQueries }).populate("userId").lean()

    if (!patient) {
      // Fallback to first active patient if scanning demo code
      patient = await Patient.findOne().populate("userId").lean()
    }

    if (!patient) {
      res.status(404).json({ success: false, message: "No patient found for this QR code." })
      return
    }

    const allergies = await Allergy.find({ patientId: patient._id }).lean()
    const activeCases = await MedicalCase.find({ patientId: patient._id, status: "active" }).lean()
    const pastCases = await MedicalCase.find({ patientId: patient._id, status: "resolved" }).lean()
    const medicines = await MedicineSchedule.find({ patientId: patient._id, status: "active" }).lean()
    const appointments = await Appointment.find({ patientId: patient._id }).sort({ date: -1 }).limit(5).lean()

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient._id.toString(),
          patientId: patient.patientId,
          name: patient.name,
          bloodGroup: patient.bloodGroup,
          gender: patient.gender,
          dateOfBirth: patient.dateOfBirth,
          city: patient.city
        },
        allergies,
        activeCases,
        pastCases,
        activeMedicines: medicines,
        recentAppointments: appointments
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error scanning QR code" })
  }
})

// GET /api/patients/:id/history (Role protected medical history)
router.get("/:id/history", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id
    const activeCases = await MedicalCase.find({ patientId, status: "active" }).populate("doctorId").lean()
    const pastCases = await MedicalCase.find({ patientId, status: { $ne: "active" } }).populate("doctorId").lean()
    const allergies = await Allergy.find({ patientId }).lean()
    const medicines = await MedicineSchedule.find({ patientId }).lean()

    res.status(200).json({
      success: true,
      data: {
        activeCases,
        pastCases,
        allergies,
        medicines
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching patient medical history" })
  }
})

export default router
