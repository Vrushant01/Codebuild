import mongoose, { Schema, Document } from "mongoose"

export interface IReceptionist extends Document {
  userId: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  name: string
  email: string
  phone?: string
  permissions: {
    manageAppointments: boolean
    manageSchedule: boolean
    viewPatientBasicInfo: boolean
    manageOrgDetails: boolean
  }
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

const ReceptionistSchema = new Schema<IReceptionist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    permissions: {
      manageAppointments: { type: Boolean, default: true },
      manageSchedule: { type: Boolean, default: true },
      viewPatientBasicInfo: { type: Boolean, default: true },
      manageOrgDetails: { type: Boolean, default: false }
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
)

export const Receptionist = mongoose.model<IReceptionist>("Receptionist", ReceptionistSchema)
