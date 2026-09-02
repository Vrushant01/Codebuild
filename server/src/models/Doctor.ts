import mongoose, { Schema, Document } from "mongoose"

export interface IDoctor extends Document {
  userId?: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  name: string
  specialization: string
  qualifications: string[]
  experienceYears: number
  consultationFee: number
  telemedicineFee?: number
  telemedicineAvailable: boolean
  rating: number
  reviewCount: number
  avatar?: string
  bio?: string
  workingDays: string[]
  workingHours: {
    start: string
    end: string
  }
  slotDurationMinutes: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, index: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 5 },
    consultationFee: { type: Number, default: 500 },
    telemedicineFee: { type: Number, default: 400 },
    telemedicineAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    avatar: { type: String },
    bio: { type: String },
    workingDays: { 
      type: [String], 
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] 
    },
    workingHours: {
      start: { type: String, default: "09:00 AM" },
      end: { type: String, default: "05:00 PM" }
    },
    slotDurationMinutes: { type: Number, default: 30 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export const Doctor = mongoose.model<IDoctor>("Doctor", DoctorSchema)
