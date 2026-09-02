import { apiClient } from "../api/apiClient"

export interface PatientIdentity {
  id: string
  patientId: string
  displayName: string
  avatarInitials: string
}

export interface PatientAccessPermissions {
  canViewAppointment: boolean
  canViewMedicalHistory: boolean
  canViewAllergies: boolean
  canViewMedication: boolean
  canViewCurrentCase: boolean
}

export const patientIdentityService = {
  validatePatientId(patientId: string): boolean {
    return /^PAT-[A-Z0-9]{6}$/i.test(patientId.trim()) || patientId.startsWith("QR_")
  },

  async findMockPatientById(patientId: string): Promise<PatientIdentity | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(`/patients/qr/${patientId}`)
      if (res && res.data && res.data.patient) {
        const p = res.data.patient
        return {
          id: p.id,
          patientId: p.patientId,
          displayName: p.name,
          avatarInitials: p.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        }
      }
    } catch (err) {}

    // Fallback known demo patients
    const normalized = patientId.trim().toUpperCase()
    if (normalized === "PAT-8F2A91" || normalized.includes("8F2A91")) {
      return {
        id: "user_123",
        patientId: "PAT-8F2A91",
        displayName: "Alex Johnson",
        avatarInitials: "AJ"
      }
    }
    return null
  },

  getPatientAccessPermissions(role: "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "PATIENT"): PatientAccessPermissions {
    if (role === "DOCTOR") {
      return {
        canViewAppointment: true,
        canViewMedicalHistory: true,
        canViewAllergies: true,
        canViewMedication: true,
        canViewCurrentCase: true
      }
    }
    
    if (role === "RECEPTIONIST") {
      return {
        canViewAppointment: true,
        canViewMedicalHistory: false,
        canViewAllergies: false,
        canViewMedication: false,
        canViewCurrentCase: false
      }
    }
    
    return {
      canViewAppointment: false,
      canViewMedicalHistory: false,
      canViewAllergies: false,
      canViewMedication: false,
      canViewCurrentCase: false
    }
  },

  async getMockClinicalData(patientId: string) {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(`/patients/qr/${patientId}`)
      if (res && res.data) {
        return {
          allergies: res.data.allergies || [],
          cases: res.data.activeCases || [],
          timeline: res.data.recentAppointments || []
        }
      }
    } catch {}

    return {
      allergies: [],
      cases: [],
      timeline: []
    }
  }
}
