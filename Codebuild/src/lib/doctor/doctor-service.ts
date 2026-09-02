import type { DoctorAppointment, DoctorStats, DoctorPatient } from "./doctor-types"
import type { AppointmentStatus } from "../booking/appointment-types"
import type { MedicalCase } from "../profile/profile-types"
import { apiClient } from "../api/apiClient"

export const doctorService = {
  async getDoctorStats(): Promise<DoctorStats> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>("/doctors/me/dashboard")
      if (res && res.data && res.data.stats) {
        return {
          todayAppointments: res.data.stats.todayCount || 0,
          pendingRequests: res.data.stats.pendingCount || 0,
          completedToday: 2,
          telemedicine: 1,
          upcomingCount: res.data.stats.upcomingCount || 0
        }
      }
    } catch (err) {}

    return {
      todayAppointments: 3,
      pendingRequests: 2,
      completedToday: 2,
      telemedicine: 1,
      upcomingCount: 5
    }
  },

  async getDoctorAppointments(filter?: "ALL" | "TODAY" | "PENDING" | "UPCOMING" | "COMPLETED" | "CANCELLED"): Promise<DoctorAppointment[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/appointments")
      if (res && res.data) {
        const todayStr = new Date().toISOString().split("T")[0]
        let list: DoctorAppointment[] = res.data.map(apt => ({
          id: apt.id || apt._id,
          status: apt.status,
          doctor: apt.doctor || { id: "doc_1", name: "Dr. Sarah Smith", specialization: "Cardiology" },
          organization: apt.organization || { id: "org_1", name: "CityCare Clinic" },
          date: apt.date,
          timeStr: apt.timeStr || apt.startTime,
          consultationType: apt.consultationType || apt.type,
          appointmentFor: apt.appointmentFor || "Myself",
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
          attendance: apt.attendanceStatus === "YES" ? "ATTENDED" : apt.attendanceStatus === "NO" ? "NOT_ATTENDED" : "UNKNOWN",
          patientProfile: {
            id: apt.patientUserId?._id || (typeof apt.patientUserId === "string" ? apt.patientUserId : apt.patientId?._id || "usr_1"),
            patientId: apt.patientId?.patientId || (typeof apt.patientId === "string" ? apt.patientId : "PAT-CURRENT"),
            name: apt.patientName || apt.patientUserId?.name || "Patient",
            email: apt.patientUserId?.email || "",
            mobile: apt.patientPhone || apt.patientUserId?.phone || "",
            preferredLanguage: "English",
            avatarInitials: (apt.patientName || apt.patientUserId?.name || "P").split(" ").map((w: string) => w[0]).join("").toUpperCase()
          },
          currentCase: apt.symptoms?.length ? {
            id: `case_${apt.id}`,
            title: apt.symptoms.join(", "),
            startDate: apt.date,
            status: "Active",
            doctorName: "Dr. Sarah Smith",
            symptoms: apt.symptoms
          } : undefined
        }))

        if (filter === "TODAY") list = list.filter(a => a.date === todayStr)
        else if (filter === "PENDING") list = list.filter(a => a.status === "PENDING")
        else if (filter === "UPCOMING") list = list.filter(a => a.date >= todayStr && (a.status === "CONFIRMED" || a.status === "ACCEPTED"))
        else if (filter === "COMPLETED") list = list.filter(a => a.status === "COMPLETED")
        else if (filter === "CANCELLED") list = list.filter(a => a.status.includes("CANCELLED"))

        return list
      }
    } catch (err) {}

    return []
  },

  async getAppointmentById(id: string): Promise<DoctorAppointment | undefined> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(`/appointments/${id}`)
      if (res && res.data) {
        const apt = res.data
        const pName = apt.patientName || apt.patientUserId?.name || "Patient"
        return {
          id: apt.id || apt._id,
          status: apt.status,
          doctor: apt.doctor,
          organization: apt.organization,
          date: apt.date,
          timeStr: apt.timeStr || apt.startTime,
          consultationType: apt.consultationType || apt.type,
          appointmentFor: apt.appointmentFor || "Myself",
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
          attendance: apt.attendanceStatus === "YES" ? "ATTENDED" : "UNKNOWN",
          patientProfile: apt.patientProfile || {
            id: apt.patientUserId?._id || (typeof apt.patientUserId === "string" ? apt.patientUserId : apt.patientId?._id || "usr_1"),
            patientId: apt.patientId?.patientId || (typeof apt.patientId === "string" ? apt.patientId : "PAT-CURRENT"),
            name: pName,
            email: apt.patientUserId?.email || "",
            mobile: apt.patientPhone || apt.patientUserId?.phone || "",
            preferredLanguage: "English",
            avatarInitials: pName.split(" ").map((w: string) => w[0]).join("").toUpperCase()
          },
          allergies: apt.allergies || [],
          medicines: apt.medicines || [],
          medicalHistory: apt.medicalHistory || [],
          currentCase: apt.currentCase || undefined
        }
      }
    } catch {}

    const all = await this.getDoctorAppointments()
    return all.find(a => a.id === id)
  },

  async acceptAppointment(id: string): Promise<DoctorAppointment> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/appointments/${id}/accept`)
    const apt = await this.getAppointmentById(id)
    return apt || (res.data as any)
  },

  async rejectAppointment(id: string, reason?: string): Promise<DoctorAppointment> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/appointments/${id}/reject`, { reason })
    const apt = await this.getAppointmentById(id)
    return apt || (res.data as any)
  },

  async cancelAppointment(id: string, reason?: string): Promise<DoctorAppointment> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/appointments/${id}/cancel`, { reason })
    const apt = await this.getAppointmentById(id)
    return apt || (res.data as any)
  },

  async completeAppointment(id: string): Promise<DoctorAppointment> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/appointments/${id}/complete`)
    const apt = await this.getAppointmentById(id)
    return apt || (res.data as any)
  },

  async getPatients(search?: string): Promise<DoctorPatient[]> {
    try {
      const url = search ? `/doctors/me/patients?search=${encodeURIComponent(search)}` : "/doctors/me/patients"
      const res = await apiClient.get<{ success: boolean; data: any[] }>(url)
      if (res && res.data) {
        return res.data.map(p => ({
          id: p.id || p.patientId,
          patientId: p.patientId,
          name: p.name,
          avatarInitials: (p.name || "Patient").split(" ").map((w: string) => w[0]).join("").toUpperCase(),
          lastAppointmentDate: p.lastVisit,
          nextAppointmentDate: p.nextAppointmentDate,
          currentCaseTitle: p.activeCasesCount > 0 ? "Active Medical Case" : "Regular Patient"
        }))
      }
    } catch {}

    return []
  },

  async getPatientById(id: string): Promise<DoctorPatient | undefined> {
    const patients = await this.getPatients()
    return patients.find(p => p.id === id || p.patientId === id)
  },

  async getAppointments(filter?: "ALL" | "TODAY" | "PENDING" | "UPCOMING" | "COMPLETED" | "CANCELLED"): Promise<DoctorAppointment[]> {
    return this.getDoctorAppointments(filter)
  },

  async getDashboardStats(): Promise<DoctorStats> {
    return this.getDoctorStats()
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus, reason?: string): Promise<DoctorAppointment> {
    if (status === "ACCEPTED" || status === "CONFIRMED") return this.acceptAppointment(id)
    if (status === "REJECTED") return this.rejectAppointment(id, reason)
    if (status === "CANCELLED" || status.includes("CANCELLED")) return this.cancelAppointment(id, reason)
    if (status === "COMPLETED") return this.completeAppointment(id)
    const apt = await this.getAppointmentById(id)
    return apt!
  },

  async updateCase(caseId: string, data: any): Promise<void> {
    await apiClient.patch(`/medical-cases/${caseId}`, data)
  },

  async addMedication(patientId: string, medData: any): Promise<void> {
    await apiClient.post("/medicines", {
      patientId,
      medicineName: medData.name,
      dosage: medData.dosage,
      frequency: medData.frequency,
      times: medData.times || ["08:00 AM", "08:00 PM"],
      foodInstruction: medData.foodInstruction || "After food",
      startDate: medData.startDate || new Date().toISOString().split("T")[0],
      instructions: medData.instructions
    })
  }
}
