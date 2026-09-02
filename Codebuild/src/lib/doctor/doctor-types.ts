import type { Appointment, AppointmentStatus, ConsultationType } from "../booking/appointment-types"
import type { PatientProfile, MedicalCase, Allergy, HistoryTimelineItem } from "../profile/profile-types"

export interface DoctorStats {
  todayAppointments: number
  pendingRequests: number
  completedToday: number
  telemedicine: number
  upcomingCount: number
}

import type { Medicine } from "../schedule/schedule-types"

// Extending Appointment for Doctor View
export interface DoctorAppointment extends Appointment {
  patientProfile: PatientProfile
  currentCase?: MedicalCase
  allergies?: Allergy[]
  medicines?: Medicine[]
  medicalHistory?: HistoryTimelineItem[]
}

export interface DoctorPatient {
  id: string
  patientId: string
  name: string
  avatarInitials: string
  lastAppointmentDate?: string
  nextAppointmentDate?: string
  currentCaseTitle?: string
}

export interface ScheduleConfig {
  workingDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  workingHours: {
    start: string // e.g., "09:00"
    end: string   // e.g., "17:00"
  }
  appointmentDurationMinutes: number
  breaks: Array<{ start: string; end: string }>
  leaves: string[] // ISO date strings
}

export interface GeneratedSlot {
  timeStr: string // e.g., "09:00 AM"
  status: "Available" | "Booked" | "Unavailable" | "Break"
}
