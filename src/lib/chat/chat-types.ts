export type ChatRole = "user" | "assistant" | "system"
export type MessageType = "text" | "question" | "symptom-summary" | "suggestion" | "transition"

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  timestamp: string
  type: MessageType
  suggestions?: string[] // Quick chips for user to click
}

export interface SymptomData {
  symptoms: string[]
  location: string | null
  duration: string | null
  severity: string | null
  associatedSymptoms: string[]
  notes: string[]
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  language: string
  messages: ChatMessage[]
  symptoms: SymptomData
  healthcareSearchReady: boolean
}
