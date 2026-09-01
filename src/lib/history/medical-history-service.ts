import type { MedicalCase, Allergy, HistoryTimelineItem } from "./medical-history-types"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class MedicalHistoryService {
  private cases: MedicalCase[] = [
    {
      id: "case_1",
      patientId: "PAT-8F2A91",
      title: "Seasonal symptoms",
      startDate: "2026-09-05",
      updatedAt: "2026-09-10",
      status: "Active",
      doctorId: "doc_1",
      doctorName: "Dr. Aarav Patel",
      organizationName: "CityCare Clinic",
      appointmentId: "apt_1",
      symptoms: ["Cough", "Mild fever", "Fatigue"],
      diagnosis: "Viral respiratory infection",
      treatment: "Rest and hydration, paracetamol for fever.",
      medicines: ["med_1"],
      notes: "Patient advised to monitor temperature and return if it exceeds 102F."
    },
    {
      id: "case_2",
      patientId: "PAT-8F2A91",
      title: "Routine Checkup",
      startDate: "2026-08-01",
      updatedAt: "2026-08-01",
      status: "Resolved",
      doctorId: "doc_1",
      doctorName: "Dr. Aarav Patel",
      organizationName: "CityCare Clinic",
      symptoms: ["None"],
      notes: "Vitals normal. Patient is healthy.",
      medicines: []
    },
    {
      id: "case_3",
      patientId: "PAT-8F2A91",
      title: "Headache and Migraine",
      startDate: "2026-06-12",
      updatedAt: "2026-06-20",
      status: "Resolved",
      doctorName: "Dr. Neha Sharma",
      organizationName: "Metro Hospital",
      symptoms: ["Severe headache", "Sensitivity to light"],
      diagnosis: "Migraine",
      treatment: "Prescribed ibuprofen and advised rest in dark room.",
      medicines: [],
      notes: "Follow up if symptoms persist."
    },
    {
      id: "case_4",
      patientId: "PAT-8F2A91",
      title: "Ankle Sprain",
      startDate: "2025-11-10",
      updatedAt: "2025-11-25",
      status: "Archived",
      doctorName: "Dr. Rohan Gupta",
      organizationName: "Ortho Clinic",
      symptoms: ["Ankle pain", "Swelling"],
      treatment: "RICE protocol, wearing ankle brace.",
      medicines: [],
      notes: "Physiotherapy recommended."
    }
  ]

  private allergies: Allergy[] = [
    {
      id: "alg_1",
      patientId: "PAT-8F2A91",
      name: "Penicillin",
      category: "Medication",
      reaction: "Skin rash",
      severity: "Moderate",
      previousOccurrence: "Happened before",
      dateAdded: "2025-01-15",
      active: true
    },
    {
      id: "alg_2",
      patientId: "PAT-8F2A91",
      name: "Peanuts",
      category: "Food",
      reaction: "Throat swelling",
      severity: "Severe",
      previousOccurrence: "Happened before",
      dateAdded: "2024-06-10",
      active: true
    }
  ]

  private timeline: HistoryTimelineItem[] = [
    {
      id: "tl_1",
      date: "2026-09-10",
      type: "Case updated",
      title: "Seasonal symptoms",
      subtitle: "Status: Active",
      doctorName: "Dr. Aarav Patel",
      referenceId: "case_1"
    },
    {
      id: "tl_2",
      date: "2026-09-05",
      type: "Appointment",
      title: "General Consultation",
      doctorName: "Dr. Aarav Patel",
      organizationName: "CityCare Clinic",
      status: "Completed",
      referenceId: "apt_1"
    },
    {
      id: "tl_3",
      date: "2026-08-01",
      type: "Case created",
      title: "Routine Checkup",
      doctorName: "Dr. Aarav Patel",
      referenceId: "case_2"
    },
    {
      id: "tl_4",
      date: "2026-06-20",
      type: "Medicine completed",
      title: "Ibuprofen course finished",
      referenceId: "case_3"
    },
    {
      id: "tl_5",
      date: "2026-06-12",
      type: "Appointment",
      title: "Neurology Consultation",
      doctorName: "Dr. Neha Sharma",
      status: "Completed"
    },
    {
      id: "tl_6",
      date: "2025-01-15",
      type: "Allergy added",
      title: "Penicillin allergy reported",
      referenceId: "alg_1"
    }
  ]

  async getPatientHistory(patientId: string) {
    await mockDelay(300)
    // Filter by patientId if real, we return all since it's mock
    return [...this.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getCurrentCases(patientId: string): Promise<MedicalCase[]> {
    await mockDelay(200)
    return this.cases.filter(c => c.status === "Active" || c.status === "Resolved" && new Date(c.updatedAt).getTime() > Date.now() - 30*24*60*60*1000).filter(c => c.status === "Active")
  }

  async getPreviousCases(patientId: string): Promise<MedicalCase[]> {
    await mockDelay(200)
    return this.cases.filter(c => c.status !== "Active")
  }

  async getCaseById(caseId: string): Promise<MedicalCase | null> {
    await mockDelay(200)
    return this.cases.find(c => c.id === caseId) || null
  }

  async getAllergies(patientId: string): Promise<Allergy[]> {
    await mockDelay(200)
    return this.allergies.filter(a => a.active)
  }

  async addAllergy(allergy: Omit<Allergy, "id" | "dateAdded" | "active">): Promise<void> {
    await mockDelay(400)
    const newAllergy: Allergy = {
      ...allergy,
      id: `alg_${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString().split("T")[0],
      active: true
    }
    this.allergies.unshift(newAllergy)

    this.timeline.unshift({
      id: `tl_${Math.random().toString(36).substr(2, 9)}`,
      date: newAllergy.dateAdded,
      type: "Allergy added",
      title: `${newAllergy.name} allergy reported`,
      referenceId: newAllergy.id
    })
  }

  async updateAllergy(id: string, updates: Partial<Allergy>): Promise<void> {
    await mockDelay(400)
    const index = this.allergies.findIndex(a => a.id === id)
    if (index !== -1) {
      this.allergies[index] = { ...this.allergies[index], ...updates }
    }
  }

  async removeAllergy(id: string): Promise<void> {
    await mockDelay(300)
    const index = this.allergies.findIndex(a => a.id === id)
    if (index !== -1) {
      this.allergies[index].active = false
    }
  }
}

export const medicalHistoryService = new MedicalHistoryService()
