import type { ReceptionistPermission } from "./receptionist-types"

class PermissionService {
  
  private permissions: ReceptionistPermission = {
    // Enabled operational permissions
    canViewAppointments: true,
    canCreateAppointments: true,
    canApproveAppointments: true,
    canCancelAppointments: true,
    canRescheduleAppointments: true,
    canCheckInPatients: true,
    canViewDoctorAvailability: true,
    canViewPatientAppointmentInfo: true,
    
    // Strictly disabled clinical permissions
    canViewMedicalHistory: false,
    canViewAllergies: false,
    canViewDiagnosis: false,
    canViewMedication: false,
    canAddMedication: false,
    canAddDiagnosis: false,
    canViewClinicalNotes: false,
  }

  async getReceptionistPermissions(): Promise<ReceptionistPermission> {
    // In a real app, this fetches from the backend based on JWT/Session
    return { ...this.permissions }
  }

  hasPermission(permission: keyof ReceptionistPermission): boolean {
    return this.permissions[permission] === true
  }
}

export const permissionService = new PermissionService()
