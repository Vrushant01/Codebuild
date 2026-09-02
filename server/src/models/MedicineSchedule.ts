import mongoose, { Schema, Document } from "mongoose"

export interface IDoseLog {
  date: string // YYYY-MM-DD
  scheduledTime: string // e.g. "08:00 AM"
  status: "taken" | "missed" | "upcoming"
  takenAt?: string
}

export interface IMedicineSchedule extends Document {
  patientId: mongoose.Types.ObjectId
  patientUserId: mongoose.Types.ObjectId
  doctorId?: mongoose.Types.ObjectId
  appointmentId?: mongoose.Types.ObjectId
  medicineName: string
  dosage: string
  frequency: string
  times: string[]
  foodInstruction: "Before food" | "After food" | "With food" | "Anytime"
  startDate: string
  endDate?: string
  reminderEnabled: boolean
  source: "DOCTOR" | "PATIENT"
  prescribedBy?: string
  instructions?: string
  status: "active" | "completed" | "cancelled"
  doseLogs: IDoseLog[]
  createdAt: Date
  updatedAt: Date
}

const DoseLogSchema = new Schema<IDoseLog>(
  {
    date: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    status: { type: String, enum: ["taken", "missed", "upcoming"], default: "upcoming" },
    takenAt: { type: String }
  },
  { _id: true }
)

const MedicineScheduleSchema = new Schema<IMedicineSchedule>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", index: true },
    patientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, default: "Twice daily" },
    times: [{ type: String }],
    foodInstruction: { 
      type: String, 
      enum: ["Before food", "After food", "With food", "Anytime"], 
      default: "After food" 
    },
    startDate: { type: String, required: true },
    endDate: { type: String },
    reminderEnabled: { type: Boolean, default: true },
    source: { type: String, enum: ["DOCTOR", "PATIENT"], default: "PATIENT" },
    prescribedBy: { type: String },
    instructions: { type: String },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active", index: true },
    doseLogs: [DoseLogSchema]
  },
  { timestamps: true }
)

export const MedicineSchedule = mongoose.model<IMedicineSchedule>("MedicineSchedule", MedicineScheduleSchema)
