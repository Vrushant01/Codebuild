import type { Doctor, Organization } from "../healthcare/types"

export type ConsultationType = "Physical" | "Online"
export type AppointmentStatus = "PENDING" | "ACCEPTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REJECTED"
export type SlotStatus = "AVAILABLE" | "BOOKED" | "FULL" | "UNAVAILABLE"
export type AttendanceStatus = "UNKNOWN" | "ATTENDED" | "NOT_ATTENDED"

export interface TimeSlot {
  id: string
  timeStr: string // e.g. "09:00 AM"
  status: SlotStatus
}

export interface DailyAvailability {
  date: string // ISO date string (YYYY-MM-DD)
  isAvailable: boolean
  slots: TimeSlot[]
}

export type PatientType = "Myself" | "Family member"

export interface AppointmentRequest {
  doctorId: string
  organizationId: string
  date: string
  timeStr: string
  consultationType: ConsultationType
  appointmentFor: PatientType
  familyMemberName?: string
  relationship?: string
}

export interface Appointment {
  id: string
  status: AppointmentStatus
  doctor: Doctor
  organization: Organization
  date: string
  timeStr: string
  consultationType: ConsultationType
  appointmentFor: PatientType
  familyMemberName?: string
  relationship?: string
  createdAt: string
  updatedAt: string
  attendance: AttendanceStatus
  cancellationReason?: string
  cancelledBy?: "Patient" | "Provider"
}
