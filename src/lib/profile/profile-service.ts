import type { PatientProfile, Allergy, MedicalCase, HistoryTimelineItem, ProfilePreferences } from "./profile-types"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class ProfileService {
  private profile: PatientProfile = {
    id: "user_123",
    patientId: "PAT-8F2A91",
    name: "Krish Barvaliya",
    email: "patient@example.com",
    mobile: "+91 98765 43210",
    preferredLanguage: "Gujarati",
    avatarInitials: "KB"
  }

  private allergies: Allergy[] = [
    {
      id: "alg_1",
      name: "Penicillin",
      category: "Medication",
      reaction: "Developed a rash after taking it.",
      dateAdded: "2026-06-15"
    },
    {
      id: "alg_2",
      name: "Peanuts",
      category: "Food",
      reaction: "Facial swelling and itching.",
      dateAdded: "2026-09-01"
    }
  ]

  private cases: MedicalCase[] = [
    {
      id: "case_1",
      title: "Abdominal discomfort",
      startDate: "2026-09-10",
      status: "Active",
      doctorName: "Dr. Aarav Patel",
      symptoms: ["Stomach pain", "Nausea"],
      notes: "Patient reports intermittent pain. Monitoring for 7 days."
    },
    {
      id: "case_2",
      title: "Seasonal illness",
      startDate: "2026-06-01",
      status: "Completed",
      organizationName: "CityCare Clinic",
      symptoms: ["Fever", "Cough"],
      diagnosis: "Viral fever"
    }
  ]

  private timeline: HistoryTimelineItem[] = [
    {
      id: "hist_1",
      date: "2026-09-10",
      type: "Case",
      title: "Abdominal discomfort",
      subtitle: "Dr. Aarav Patel",
      status: "Active",
      referenceId: "case_1"
    },
    {
      id: "hist_2",
      date: "2026-08-30",
      type: "Appointment",
      title: "Cardiology Checkup",
      subtitle: "Dr. Aarav Patel",
      status: "Completed",
      referenceId: "apt_past_1"
    },
    {
      id: "hist_3",
      date: "2026-06-15",
      type: "Treatment",
      title: "Amoxicillin course",
      subtitle: "Completed 7-day course",
      status: "Completed",
      referenceId: "med_past_1"
    }
  ]

  private preferences: ProfilePreferences = {
    appointmentReminders: true,
    medicineReminders: true,
    doctorFollowUp: true,
    telemedicineReminders: true,
    medicalInfoAccess: "authorized",
    profileVisibility: "private"
  }

  async getProfile(): Promise<PatientProfile> {
    await mockDelay(300)
    return this.profile
  }

  async updateProfile(updates: Partial<PatientProfile>): Promise<PatientProfile> {
    await mockDelay(500)
    this.profile = { ...this.profile, ...updates }
    return this.profile
  }

  async getAllergies(): Promise<Allergy[]> {
    await mockDelay(200)
    return this.allergies
  }

  async addAllergy(allergy: Omit<Allergy, "id" | "dateAdded">): Promise<void> {
    await mockDelay(400)
    this.allergies.unshift({
      ...allergy,
      id: `alg_${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString().split("T")[0]
    })
  }

  async updateAllergy(id: string, updates: Partial<Omit<Allergy, "id" | "dateAdded">>): Promise<void> {
    await mockDelay(400)
    const index = this.allergies.findIndex(a => a.id === id)
    if (index !== -1) {
      this.allergies[index] = { ...this.allergies[index], ...updates }
    }
  }

  async removeAllergy(id: string): Promise<void> {
    await mockDelay(300)
    this.allergies = this.allergies.filter(a => a.id !== id)
  }

  async getCases(): Promise<MedicalCase[]> {
    await mockDelay(300)
    return this.cases
  }

  async getHistoryTimeline(): Promise<HistoryTimelineItem[]> {
    await mockDelay(400)
    // Sort descending by date
    return [...this.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getPreferences(): Promise<ProfilePreferences> {
    await mockDelay(200)
    return this.preferences
  }

  async updatePreferences(updates: Partial<ProfilePreferences>): Promise<ProfilePreferences> {
    await mockDelay(300)
    this.preferences = { ...this.preferences, ...updates }
    return this.preferences
  }

  async getMedicalSummary() {
    await mockDelay(200)
    return {
      activeCasesCount: this.cases.filter(c => c.status === "Active").length,
      allergiesCount: this.allergies.length,
      activeMedicinesCount: 2 // Mocked from Schedule state conceptually
    }
  }
}

export const profileService = new ProfileService()
