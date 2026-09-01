export interface PatientProfile {
  id: string
  patientId: string // e.g. PAT-8F2A91
  name: string
  email: string
  mobile: string
  preferredLanguage: string
  avatarInitials: string
}

export type AllergyCategory = "Medication" | "Food" | "Environmental" | "Other"

export interface Allergy {
  id: string
  name: string
  category: AllergyCategory
  reaction: string
  dateAdded: string
}

export interface MedicalCase {
  id: string
  title: string
  startDate: string
  status: "Active" | "Completed"
  doctorId?: string
  doctorName?: string
  organizationName?: string
  symptoms: string[]
  diagnosis?: string
  notes?: string
}

export interface HistoryTimelineItem {
  id: string
  date: string
  type: "Case" | "Appointment" | "Treatment"
  title: string
  subtitle?: string
  status: string
  referenceId: string // e.g., appointmentId, caseId, medicineId
}

export interface ProfilePreferences {
  appointmentReminders: boolean
  medicineReminders: boolean
  doctorFollowUp: boolean
  telemedicineReminders: boolean
  medicalInfoAccess: "authorized" | "not_authorized" | "pending"
  profileVisibility: "private"
}
