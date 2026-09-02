import type { Appointment, ConsultationType, AppointmentStatus, TimeSlot } from "../booking/appointment-types"
import type { Doctor, Organization } from "../healthcare/types"

export interface ReceptionistPermission {
  canViewAppointments: boolean
  canCreateAppointments: boolean
  canApproveAppointments: boolean
  canCancelAppointments: boolean
  canRescheduleAppointments: boolean
  canCheckInPatients: boolean
  canViewDoctorAvailability: boolean
  canViewPatientAppointmentInfo: boolean
  
  // Protected fields - strictly false for Receptionist
  canViewMedicalHistory: boolean
  canViewAllergies: boolean
  canViewDiagnosis: boolean
  canViewMedication: boolean
  canAddMedication: boolean
  canAddDiagnosis: boolean
  canViewClinicalNotes: boolean
}

// A specific view model that intentionally omits any clinical information
export interface ReceptionistAppointmentView {
  appointmentId: string
  patientId: string
  patientName: string
  patientIdentifier: string
  doctor: Doctor
  organization: Organization
  date: string
  timeStr: string
  type: ConsultationType
  status: AppointmentStatus
  checkInStatus: "Expected" | "Arrived" | "Checked In" | "No-Show" | null
}

export interface ReceptionistPatientView {
  patientId: string
  patientName: string
  patientIdentifier: string
  email?: string
  mobile?: string
  lastVisit?: string
  nextAppointment?: ReceptionistAppointmentView
}

export interface ReceptionDashboardStats {
  todayAppointments: number
  pendingRequests: number
  confirmed: number
  cancelled: number
}
