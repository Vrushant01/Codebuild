import type { PatientProfile, Allergy, MedicalCase, HistoryTimelineItem, ProfilePreferences } from "./profile-types"
import { apiClient } from "../api/apiClient"

class ProfileService {
  private preferences: ProfilePreferences = {
    appointmentReminders: true,
    medicineReminders: true,
    doctorFollowUp: true,
    telemedicineReminders: true,
    medicalInfoAccess: "authorized",
    profileVisibility: "private"
  }

  async getProfile(): Promise<PatientProfile> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>("/patients/me")
      if (res && res.data) {
        const p = res.data
        return {
          id: p.id || p._id,
          patientId: p.patientId || "PAT-8F2A91",
          name: p.name,
          email: p.email || "patient@medireach.demo",
          mobile: p.phone || "+91 98765 43210",
          preferredLanguage: p.preferredLanguage || "en",
          avatarInitials: p.name.split(" ").map((w: string) => w[0]).join("").toUpperCase()
        }
      }
    } catch (err) {}

    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    return {
      id: user.id || "user_123",
      patientId: user.patientId || "PAT-8F2A91",
      name: user.name || "Alex Johnson",
      email: user.email || "patient@medireach.demo",
      mobile: user.mobile || user.phone || "+91 98765 43210",
      preferredLanguage: user.preferredLanguage || "English",
      avatarInitials: (user.name || "Alex").split(" ").map((w: string) => w[0]).join("").toUpperCase()
    }
  }

  async updateProfile(updates: Partial<PatientProfile>): Promise<PatientProfile> {
    try {
      const res = await apiClient.put<{ success: boolean; data: any }>("/patients/me", {
        name: updates.name,
        phone: updates.mobile,
        preferredLanguage: updates.preferredLanguage
      })
      if (res && res.data) {
        const p = res.data
        return {
          id: p._id || p.id,
          patientId: p.patientId,
          name: p.name,
          email: p.email,
          mobile: p.phone,
          preferredLanguage: p.preferredLanguage,
          avatarInitials: p.name.split(" ").map((w: string) => w[0]).join("").toUpperCase()
        }
      }
    } catch (err) {}

    return this.getProfile()
  }

  async getAllergies(): Promise<Allergy[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/allergies")
      if (res && res.data) {
        return res.data.map(a => ({
          id: a.id || a._id,
          name: a.allergyName,
          category: "Medication",
          reaction: a.reactionDescription,
          dateAdded: a.diagnosedDate || new Date(a.createdAt).toISOString().split("T")[0]
        }))
      }
    } catch {}

    return []
  }

  async addAllergy(allergy: Omit<Allergy, "id" | "dateAdded">): Promise<Allergy> {
    try {
      const res = await apiClient.post<{ success: boolean; data: any }>("/allergies", {
        allergyName: allergy.name,
        reactionDescription: allergy.reaction,
        severity: "moderate"
      })
      if (res && res.data) {
        const a = res.data
        return {
          id: a.id || a._id,
          name: a.allergyName,
          category: "Medication",
          reaction: a.reactionDescription,
          dateAdded: a.diagnosedDate || new Date().toISOString().split("T")[0]
        }
      }
    } catch {}

    return {
      ...allergy,
      id: `alg_${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0]
    }
  }

  async getCases(): Promise<MedicalCase[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/medical-cases")
      if (res && res.data) {
        return res.data.map(c => ({
          id: c.id || c._id,
          title: c.title,
          startDate: c.date,
          status: c.status === "active" ? "Active" : "Completed",
          doctorName: c.doctor?.name || "Doctor",
          symptoms: c.symptoms || [],
          diagnosis: c.diagnosis,
          notes: c.notes
        }))
      }
    } catch {}

    return []
  }

  async getHistoryTimeline(): Promise<HistoryTimelineItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/appointments")
      if (res && res.data) {
        return res.data.map(a => ({
          id: `hist_${a.id || a._id}`,
          date: a.date,
          type: "Appointment",
          title: `${a.consultationType || a.type} Appointment`,
          subtitle: a.doctor?.name || "Doctor Consultation",
          status: a.status === "COMPLETED" ? "Completed" : "Active",
          referenceId: a.id || a._id
        }))
      }
    } catch {}

    return []
  }

  async getMedicalSummary(): Promise<{ activeCasesCount: number; activeMedicinesCount: number; allergiesCount: number }> {
    try {
      const [cases, allergies, meds] = await Promise.all([
        this.getCases(),
        this.getAllergies(),
        apiClient.get<{ success: boolean; data: any[] }>("/medicines")
      ])
      return {
        activeCasesCount: cases.filter(c => c.status === "Active").length,
        activeMedicinesCount: (meds?.data || []).filter(m => m.status === "active").length,
        allergiesCount: allergies.length
      }
    } catch {
      return { activeCasesCount: 1, activeMedicinesCount: 2, allergiesCount: 1 }
    }
  }

  async updateAllergy(id: string, updates: Partial<Allergy>): Promise<void> {
    // Allergy updates if needed
  }

  async removeAllergy(id: string): Promise<void> {
    try {
      await apiClient.delete(`/allergies/${id}`)
    } catch {}
  }

  async getPreferences(): Promise<ProfilePreferences> {
    return this.preferences
  }

  async updatePreferences(updates: Partial<ProfilePreferences>): Promise<ProfilePreferences> {
    this.preferences = { ...this.preferences, ...updates }
    return this.preferences
  }
}

export const profileService = new ProfileService()
