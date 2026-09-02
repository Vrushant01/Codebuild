import mongoose, { Schema, Document } from "mongoose"

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId
  patientId: string // Unique identifier e.g. PAT-A1B2C3
  name: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: "Male" | "Female" | "Other"
  bloodGroup?: string
  address?: string
  city?: string
  qrCodeToken: string
  preferredLanguage: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  createdAt: Date
  updatedAt: Date
}

const PatientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    patientId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    bloodGroup: { type: String },
    address: { type: String },
    city: { type: String, default: "Ahmedabad" },
    qrCodeToken: { type: String, required: true, unique: true },
    preferredLanguage: { type: String, default: "en" },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String }
    }
  },
  { timestamps: true }
)

export const Patient = mongoose.model<IPatient>("Patient", PatientSchema)
