import mongoose, { Schema, Document } from "mongoose"

export interface IMedicalCase extends Document {
  patientId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  organizationId?: mongoose.Types.ObjectId
  appointmentId?: mongoose.Types.ObjectId
  title: string
  symptoms: string[]
  diagnosis: string
  treatment: string
  notes?: string
  prescribedMedicines?: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  status: "active" | "resolved" | "monitoring"
  date: string // YYYY-MM-DD
  createdAt: Date
  updatedAt: Date
}

const MedicalCaseSchema = new Schema<IMedicalCase>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", index: true },
    title: { type: String, required: true },
    symptoms: [{ type: String }],
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    notes: { type: String },
    prescribedMedicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String }
      }
    ],
    status: { type: String, enum: ["active", "resolved", "monitoring"], default: "active", index: true },
    date: { type: String, required: true }
  },
  { timestamps: true }
)

export const MedicalCase = mongoose.model<IMedicalCase>("MedicalCase", MedicalCaseSchema)
