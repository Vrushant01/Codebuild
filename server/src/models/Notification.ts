import mongoose, { Schema, Document } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: string
  title: string
  message: string
  relatedAppointmentId?: mongoose.Types.ObjectId
  actionUrl?: string
  read: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { 
      type: String, 
      default: "medicine" 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedAppointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    actionUrl: { type: String },
    read: { type: Boolean, default: false, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema)
