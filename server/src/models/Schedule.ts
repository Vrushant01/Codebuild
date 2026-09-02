import mongoose, { Schema, Document } from "mongoose"

export interface ISchedule extends Document {
  doctorId: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  workingDays: string[]
  workingHours: {
    start: string
    end: string
  }
  slotDurationMinutes: number
  breakTimes: {
    start: string
    end: string
    label?: string
    title?: string
  }[]
  unavailability?: {
    start: string
    end: string
    label?: string
    day?: string
  }[]
  leaveDates: string[] // YYYY-MM-DD
  leaveRanges?: {
    start: string
    end: string
    reason?: string
  }[]
  dayHours?: Record<string, { start: string; end: string }>
  dateOverrides?: Array<{ date: string; start: string; end: string }>
  config?: any
  maxPatientsPerSlot: number
  createdAt: Date
  updatedAt: Date
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, unique: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    workingDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    workingHours: {
      start: { type: String, default: "09:00 AM" },
      end: { type: String, default: "05:00 PM" }
    },
    slotDurationMinutes: { type: Number, default: 30 },
    breakTimes: [
      {
        start: { type: String, default: "01:00 PM" },
        end: { type: String, default: "02:00 PM" },
        title: { type: String, default: "Lunch Break" },
        label: { type: String, default: "Lunch Break" }
      }
    ],
    unavailability: [
      {
        start: { type: String },
        end: { type: String },
        label: { type: String },
        day: { type: String }
      }
    ],
    leaveDates: [{ type: String }],
    leaveRanges: [
      {
        start: { type: String },
        end: { type: String },
        reason: { type: String }
      }
    ],
    dayHours: { type: Schema.Types.Mixed },
    dateOverrides: [
      {
        date: { type: String },
        start: { type: String },
        end: { type: String }
      }
    ],
    config: { type: Schema.Types.Mixed },
    maxPatientsPerSlot: { type: Number, default: 1 }
  },
  { timestamps: true }
)

export const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema)
