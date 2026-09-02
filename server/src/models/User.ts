import mongoose, { Schema, Document } from "mongoose"

export type UserRole = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "ORGANIZATION"
export type AccountStatus = "active" | "pending" | "suspended" | "inactive"

export interface IUser extends Document {
  name: string
  email?: string
  phone?: string
  passwordHash: string
  role: UserRole
  preferredLanguage: string
  accountStatus: AccountStatus
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true, sparse: true },
    phone: { type: String, trim: true, index: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN", "ORGANIZATION"], 
      default: "PATIENT",
      required: true,
      index: true
    },
    preferredLanguage: { type: String, default: "en" },
    accountStatus: { 
      type: String, 
      enum: ["active", "pending", "suspended", "inactive"], 
      default: "active" 
    },
    avatar: { type: String }
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>("User", UserSchema)
