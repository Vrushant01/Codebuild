import type { Doctor } from "../healthcare/types"
import type { Appointment } from "../booking/appointment-types"

export interface OrganizationAppointment extends Appointment {
  patientId: string
  patientName: string
}

export interface OrganizationStats {
  todayAppointments: number
  doctors: number
  receptionists: number
  services: number
  upcomingAppointments: number
}

export type StaffStatus = "Active" | "Pending" | "Suspended"

export interface Receptionist {
  id: string
  organizationId: string
  name: string
  email: string
  mobile: string
  status: StaffStatus
  permissions: {
    appointmentManagement: boolean
    patientBooking: boolean
    medicalDiagnosis: boolean
    prescriptionManagement: boolean
  }
}

export type ServiceStatus = "Active" | "Inactive"

export interface HealthcareService {
  id: string
  organizationId: string
  name: string
  description: string
  status: ServiceStatus
  doctorIds: string[]
}

// Re-using the Doctor type but defining the specific organization relationship
export type OrganizationDoctor = Doctor & {
  status: StaffStatus
}

export interface NotificationSettings {
  appointmentAlerts: boolean
  cancellationAlerts: boolean
  newBookingAlerts: boolean
  staffActivity: boolean
}
