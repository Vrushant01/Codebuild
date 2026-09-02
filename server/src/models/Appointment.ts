import mongoose, { Schema, Document } from "mongoose"

export type AppointmentType = "Physical" | "Online"
export type AppointmentStatus = 
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED_BY_PATIENT"
  | "CANCELLED_BY_DOCTOR"
  | "COMPLETED"
  | "NO_SHOW"

export type AttendanceStatus = "YES" | "NO" | "UNKNOWN"

export interface IAppointment extends Document {
  patientId?: mongoose.Types.ObjectId
  patientUserId: mongoose.Types.ObjectId
  patientName: string
  patientPhone?: string
  doctorId: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  date: string // YYYY-MM-DD
  startTime: string // e.g. "10:30 AM" or "10:30"
  endTime?: string
  type: AppointmentType
  status: AppointmentStatus
  cancellationReason?: string
  cancelledBy?: "Patient" | "Doctor" | "Receptionist" | "Admin"
  attendanceStatus: AttendanceStatus
  reminderStatus: "pending" | "sent" | "dismissed"
  appointmentFor: "Myself" | "Family Member"
  beneficiaryName?: string
  symptoms?: string[]
  notes?: string
  fee: number
  paymentStatus: "paid" | "pending"
  telemedicineRoomId?: string
  createdAt: Date
  updatedAt: Date
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", index: true },
    patientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true, index: true },
    endTime: { type: String },
    type: { type: String, enum: ["Physical", "Online"], default: "Physical" },
    status: { 
      type: String, 
      enum: [
        "PENDING",
        "ACCEPTED",
        "CONFIRMED",
        "REJECTED",
        "CANCELLED_BY_PATIENT",
        "CANCELLED_BY_DOCTOR",
        "COMPLETED",
        "NO_SHOW"
      ],
      default: "PENDING",
      index: true
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ["Patient", "Doctor", "Receptionist", "Admin"] },
    attendanceStatus: { type: String, enum: ["YES", "NO", "UNKNOWN"], default: "UNKNOWN" },
    reminderStatus: { type: String, enum: ["pending", "sent", "dismissed"], default: "pending" },
    appointmentFor: { type: String, enum: ["Myself", "Family Member"], default: "Myself" },
    beneficiaryName: { type: String },
    symptoms: [{ type: String }],
    notes: { type: String },
    fee: { type: Number, default: 500 },
    paymentStatus: { type: String, enum: ["paid", "pending"], default: "pending" },
    telemedicineRoomId: { type: String }
  },
  { timestamps: true }
)

// Index for high performance queries
AppointmentSchema.index({ doctorId: 1, date: 1, startTime: 1 })
AppointmentSchema.index({ patientUserId: 1, date: 1 })
AppointmentSchema.index({ organizationId: 1, date: 1 })

export const Appointment = mongoose.model<IAppointment>("Appointment", AppointmentSchema)
