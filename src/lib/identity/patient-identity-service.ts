import { profileService } from "../profile/profile-service"
import type { PatientProfile, Allergy, MedicalCase } from "../profile/profile-types"

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

// Mock patients that exist in the system
const MOCK_PATIENTS: Record<string, PatientIdentity> = {
  "PAT-8F2A91": {
    id: "user_123",
    patientId: "PAT-8F2A91",
    displayName: "Krish Barvaliya",
    avatarInitials: "KB"
  },
  "PAT-4B7C20": {
    id: "user_456",
    patientId: "PAT-4B7C20",
    displayName: "Rahul Sharma",
    avatarInitials: "RS"
  },
  "PAT-9D31AF": {
    id: "user_789",
    patientId: "PAT-9D31AF",
    displayName: "Priya Patel",
    avatarInitials: "PP"
  }
}

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const patientIdentityService = {
  
  validatePatientId(patientId: string): boolean {
    return /^PAT-[A-Z0-9]{6}$/i.test(patientId.trim())
  },

  async findMockPatientById(patientId: string): Promise<PatientIdentity | null> {
    await mockDelay(800) // Simulate network request
    const normalized = patientId.trim().toUpperCase()
    return MOCK_PATIENTS[normalized] || null
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
    
    // Admin has no clinical access via scanner
    return {
      canViewAppointment: false,
      canViewMedicalHistory: false,
      canViewAllergies: false,
      canViewMedication: false,
      canViewCurrentCase: false
    }
  },

  // Helpers to fetch associated mock data if permitted
  async getMockClinicalData(patientId: string) {
    await mockDelay(400)
    
    // For demo purposes, we will return the mock profileService data 
    // for PAT-8F2A91 (Krish Barvaliya). For others, empty mock data.
    if (patientId.toUpperCase() === "PAT-8F2A91") {
      return {
        allergies: await profileService.getAllergies(),
        cases: await profileService.getCases(),
        timeline: await profileService.getHistoryTimeline()
      }
    }
    
    return {
      allergies: [],
      cases: [],
      timeline: []
    }
  }
}
