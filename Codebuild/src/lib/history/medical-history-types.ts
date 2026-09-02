// Re-export shared elements if needed, or define the new expanded history types here.

export type CaseStatus = "Active" | "Resolved" | "Archived"
export type AllergySeverity = "Mild" | "Moderate" | "Severe" | "Not sure"
export type PreviousOccurrence = "First time" | "Happened before" | "Not sure"
export type AllergyCategory = "Medication" | "Food" | "Environmental" | "Other"

export interface MedicalCase {
  id: string
  patientId: string
  doctorId?: string
  doctorName?: string
  appointmentId?: string
  organizationId?: string
  organizationName?: string
  title: string
  symptoms: string[]
  diagnosis?: string
  treatment?: string
  medicines: string[] // medicine IDs
  notes?: string
  status: CaseStatus
  startDate: string // YYYY-MM-DD
  updatedAt: string
}

export interface Allergy {
  id: string
  patientId: string
  name: string
  category: AllergyCategory
  reaction?: string
  symptoms?: string
  severity?: AllergySeverity
  previousOccurrence?: PreviousOccurrence
  notes?: string
  active: boolean
  dateAdded: string
}

export type TimelineEventType = "Appointment" | "Case created" | "Case updated" | "Medicine prescribed" | "Medicine completed" | "Allergy added"

export interface HistoryTimelineItem {
  id: string
  date: string
  type: TimelineEventType
  title: string
  subtitle?: string
  status?: string
  referenceId?: string // Link back to case, apt, medicine, or allergy
  doctorId?: string
  doctorName?: string
  organizationName?: string
}
