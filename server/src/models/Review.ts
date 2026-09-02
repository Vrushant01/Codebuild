import mongoose, { Schema, Document } from "mongoose"

export interface IReview extends Document {
  patientUserId: mongoose.Types.ObjectId
  patientName: string
  appointmentId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  rating: number // 1 to 5
  comment: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    patientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    verified: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export const Review = mongoose.model<IReview>("Review", ReviewSchema)
