import mongoose, { Schema, Document } from "mongoose"

export interface IAllergy extends Document {
  patientId: mongoose.Types.ObjectId
  patientUserId: mongoose.Types.ObjectId
  allergyName: string
  reactionDescription: string
  severity: "mild" | "moderate" | "severe"
  diagnosedDate?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const AllergySchema = new Schema<IAllergy>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", index: true },
    patientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    allergyName: { type: String, required: true },
    reactionDescription: { type: String, required: true },
    severity: { type: String, enum: ["mild", "moderate", "severe"], default: "moderate" },
    diagnosedDate: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
)

export const Allergy = mongoose.model<IAllergy>("Allergy", AllergySchema)
