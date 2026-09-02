export type MedicineStatus = "active" | "completed" | "cancelled"
export type DoseStatus = "upcoming" | "due" | "taken" | "missed" | "cancelled"
export type FoodInstruction = "Before food" | "After food" | "With food" | "Anytime" | "No specific instruction"
export type MedicineSource = "DOCTOR" | "PATIENT"

export interface Medicine {
  id: string
  name: string
  dosage: string // e.g., "500 mg", "1 tablet"
  frequency: string // e.g., "Once daily", "Twice daily"
  times: string[] // e.g., ["08:00 AM", "08:00 PM"]
  foodInstruction: string
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  durationDays?: number // Legacy duration
  instructions?: string
  status: MedicineStatus
  source: MedicineSource
  reminderEnabled: boolean
  prescribedBy?: string
  relatedAppointmentId?: string
}

export interface Dose {
  id: string
  medicineId: string
  date: string // YYYY-MM-DD
  scheduledTime: string // e.g., "08:00 AM"
  status: DoseStatus
  takenAt?: string // ISO string
}

export interface DailySchedule {
  date: string
  doses: (Dose & { medicine: Medicine })[]
  completedCount: number
  totalCount: number
}
