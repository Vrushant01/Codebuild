import mongoose, { Schema, Document } from "mongoose"

export interface IChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  text: string
  timestamp: string
  type?: "text" | "question" | "summary" | "redirection"
  suggestions?: string[]
}

export interface ISymptomData {
  symptoms: string[]
  location?: string | null
  duration?: string | null
  severity?: string | null
  associatedSymptoms?: string[]
  notes?: string[]
}

export interface IChatSession extends Document {
  patientUserId?: mongoose.Types.ObjectId
  sessionId: string
  language: string
  messages: IChatMessage[]
  symptoms: ISymptomData
  extractedSpecialization?: string
  status: "active" | "completed"
  createdAt: Date
  updatedAt: Date
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    patientUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    language: { type: String, default: "en" },
    messages: [
      {
        id: { type: String, required: true },
        role: { type: String, enum: ["user", "assistant", "system"], required: true },
        text: { type: String, required: true },
        timestamp: { type: String, required: true },
        type: { type: String, default: "text" },
        suggestions: [{ type: String }]
      }
    ],
    symptoms: {
      symptoms: [{ type: String }],
      location: { type: String },
      duration: { type: String },
      severity: { type: String },
      associatedSymptoms: [{ type: String }],
      notes: [{ type: String }]
    },
    extractedSpecialization: { type: String },
    status: { type: String, enum: ["active", "completed"], default: "active" }
  },
  { timestamps: true }
)

export const ChatSession = mongoose.model<IChatSession>("ChatSession", ChatSessionSchema)
