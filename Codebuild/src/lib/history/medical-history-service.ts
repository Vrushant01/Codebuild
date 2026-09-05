import type { MedicalCase, Allergy, HistoryTimelineItem, AllergySeverity, PreviousOccurrence } from "./medical-history-types"
import { apiClient } from "../api/apiClient"

class MedicalHistoryService {
  async getPatientHistory(patientId?: string): Promise<HistoryTimelineItem[]> {
    try {
      const q = patientId ? `?patientId=${patientId}` : ""
      const [casesRes, allergiesRes, apptsRes] = await Promise.allSettled([
        apiClient.get<{ success: boolean; data: any[] }>(`/medical-cases${q}`),
        apiClient.get<{ success: boolean; data: any[] }>(`/allergies${q}`),
        apiClient.get<{ success: boolean; data: any[] }>(`/appointments${q}`)
      ])

      const timeline: HistoryTimelineItem[] = []

      if (casesRes.status === "fulfilled" && casesRes.value?.data) {
        casesRes.value.data.forEach(c => {
          timeline.push({
            id: `tl_case_${c.id || c._id}`,
            date: c.date || new Date(c.createdAt).toISOString().split("T")[0],
            type: "Case updated",
            title: c.title,
            subtitle: `Diagnosis: ${c.diagnosis}`,
            doctorName: c.doctor?.name || "Doctor",
            referenceId: c.id || c._id
          })
        })
      }

      if (apptsRes.status === "fulfilled" && apptsRes.value?.data) {
        apptsRes.value.data.forEach(a => {
          timeline.push({
            id: `tl_apt_${a.id || a._id}`,
            date: a.date,
            type: "Appointment",
            title: `${a.type || "Consultation"} - ${a.doctor?.specialization || "General"}`,
            doctorName: a.doctor?.name || "Doctor",
            organizationName: a.organization?.name,
            status: a.status,
            referenceId: a.id || a._id
          })
        })
      }

      if (allergiesRes.status === "fulfilled" && allergiesRes.value?.data) {
        allergiesRes.value.data.forEach(alg => {
          timeline.push({
            id: `tl_alg_${alg.id || alg._id}`,
            date: alg.diagnosedDate || new Date(alg.createdAt).toISOString().split("T")[0],
            type: "Allergy added",
            title: `${alg.allergyName} allergy reported (${alg.severity})`,
            referenceId: alg.id || alg._id
          })
        })
      }

      return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (err) {
      return []
    }
  }

  async getCurrentCases(patientId?: string): Promise<MedicalCase[]> {
    try {
      const q = patientId ? `&patientId=${patientId}` : ""
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/medical-cases?status=active${q}`)
      if (res && res.data) {
        return res.data.map(c => ({
          id: c.id || c._id,
          patientId: c.patientId?.patientId || "PAT-CURRENT",
          title: c.title,
          startDate: c.date || new Date(c.createdAt).toISOString().split("T")[0],
          updatedAt: new Date(c.updatedAt || c.createdAt).toISOString().split("T")[0],
          status: "Active",
          doctorId: c.doctorId?._id || c.doctorId,
          doctorName: c.doctor?.name || "Doctor",
          organizationName: c.organizationId?.name || "Hospital",
          appointmentId: c.appointmentId,
          symptoms: c.symptoms || [],
          diagnosis: c.diagnosis,
          treatment: c.treatment,
          medicines: c.prescribedMedicines?.map((m: any) => m.name) || [],
          notes: c.notes
        }))
      }
    } catch {}

    return []
  }

  async getPreviousCases(patientId?: string): Promise<MedicalCase[]> {
    try {
      const q = patientId ? `&patientId=${patientId}` : ""
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/medical-cases?status=resolved${q}`)
      if (res && res.data) {
        return res.data.map(c => ({
          id: c.id || c._id,
          patientId: c.patientId?.patientId || "PAT-CURRENT",
          title: c.title,
          startDate: c.date || new Date(c.createdAt).toISOString().split("T")[0],
          updatedAt: new Date(c.updatedAt || c.createdAt).toISOString().split("T")[0],
          status: "Resolved",
          doctorId: c.doctorId?._id || c.doctorId,
          doctorName: c.doctor?.name || "Doctor",
          organizationName: c.organizationId?.name || "Hospital",
          appointmentId: c.appointmentId,
          symptoms: c.symptoms || [],
          diagnosis: c.diagnosis,
          treatment: c.treatment,
          medicines: c.prescribedMedicines?.map((m: any) => m.name) || [],
          notes: c.notes
        }))
      }
    } catch {}

    return []
  }

  async getCaseById(caseId: string): Promise<MedicalCase | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/medical-cases")
      if (res && res.data) {
        const c = res.data.find(item => (item.id || item._id) === caseId)
        if (c) {
          return {
            id: c.id || c._id,
            patientId: c.patientId?.patientId || "PAT-CURRENT",
            title: c.title,
            startDate: c.date || new Date(c.createdAt).toISOString().split("T")[0],
            updatedAt: new Date(c.updatedAt || c.createdAt).toISOString().split("T")[0],
            status: c.status === "active" ? "Active" : "Resolved",
            doctorId: c.doctorId?._id || c.doctorId,
            doctorName: c.doctor?.name || "Doctor",
            organizationName: c.organizationId?.name || "Hospital",
            appointmentId: c.appointmentId,
            symptoms: c.symptoms || [],
            diagnosis: c.diagnosis,
            treatment: c.treatment,
            medicines: c.prescribedMedicines?.map((m: any) => m.name) || [],
            notes: c.notes
          }
        }
      }
    } catch {}

    return null
  }

  async getAllergies(patientId?: string): Promise<Allergy[]> {
    try {
      const q = patientId ? `?patientId=${patientId}` : ""
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/allergies${q}`)
      if (res && res.data) {
        return res.data.map(alg => ({
          id: alg.id || alg._id,
          patientId: "PAT-CURRENT",
          name: alg.allergyName,
          category: alg.category || "Medication",
          reaction: alg.reactionDescription,
          severity: (alg.severity === "severe" ? "Severe" : alg.severity === "mild" ? "Mild" : "Moderate") as AllergySeverity,
          previousOccurrence: "Happened before" as PreviousOccurrence,
          dateAdded: alg.diagnosedDate || (alg.createdAt ? new Date(alg.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
          active: true
        }))
      }
    } catch {}

    return []
  }

  async addAllergy(allergy: Omit<Allergy, "id" | "dateAdded" | "active">): Promise<void> {
    try {
      await apiClient.post("/allergies", {
        allergyName: allergy.name,
        reactionDescription: allergy.reaction || "Allergic reaction",
        category: (allergy as any).category || "Medication",
        severity: allergy.severity ? allergy.severity.toLowerCase() : "moderate",
        diagnosedDate: new Date().toISOString().split("T")[0],
        notes: allergy.previousOccurrence
      })
    } catch (err) {
      console.warn("⚠️ Error saving allergy:", err)
    }
  }

  async updateAllergy(id: string, updates: Partial<Allergy>): Promise<void> {
    try {
      await apiClient.put(`/allergies/${id}`, {
        allergyName: updates.name,
        reactionDescription: updates.reaction,
        category: (updates as any).category,
        severity: updates.severity ? updates.severity.toLowerCase() : undefined
      })
    } catch (err) {
      console.warn("⚠️ Error updating allergy:", err)
    }
  }

  async removeAllergy(id: string): Promise<void> {
    try {
      await apiClient.delete(`/allergies/${id}`)
    } catch (err) {}
  }
}

export const medicalHistoryService = new MedicalHistoryService()
