import type { 
  ReceptionistAppointmentView, 
  ReceptionistPatientView, 
  ReceptionDashboardStats 
} from "./receptionist-types"
import { apiClient } from "../api/apiClient"

class ReceptionistService {
  async getAppointments(): Promise<ReceptionistAppointmentView[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/appointments")
      if (res && res.data) {
        return res.data.map(apt => ({
          appointmentId: apt.id || apt._id,
          patientId: apt.patientUserId?._id || (typeof apt.patientUserId === 'string' ? apt.patientUserId : apt.id || "patient"),
          patientName: apt.patientName || apt.patientUserId?.name || "Patient",
          patientIdentifier: apt.patientIdentifier || apt.patientId?.patientId || `PAT-${(apt.id || apt._id || "").toString().slice(-6).toUpperCase()}`,
          doctor: apt.doctor || { id: "doc_1", name: "Doctor", specialization: "General Medicine" },
          organization: apt.organization || { id: "org_1", name: "Hospital", city: "Ahmedabad" },
          date: apt.date,
          timeStr: apt.timeStr || apt.startTime,
          type: apt.consultationType || apt.type || "Physical",
          status: apt.status,
          checkInStatus: apt.status === "COMPLETED" ? null : 
                         apt.attendance === "YES" || apt.attendanceStatus === "YES" ? "Checked In" :
                         apt.attendance === "NO" || apt.attendanceStatus === "NO" ? "No-Show" :
                         "Expected"
        }))
      }
    } catch (err) {
      console.error("Error fetching receptionist appointments:", err)
    }

    return []
  }

  async getDashboardStats(): Promise<ReceptionDashboardStats> {
    const apts = await this.getAppointments()
    const today = new Date().toISOString().split("T")[0]
    const todayApts = apts.filter(a => a.date === today)
    
    return {
      todayAppointments: todayApts.length,
      pendingRequests: apts.filter(a => a.status === "PENDING").length,
      confirmed: todayApts.filter(a => a.status === "CONFIRMED" || a.status === "ACCEPTED").length,
      cancelled: todayApts.filter(a => a.status.includes("CANCELLED")).length
    }
  }

  async getAppointment(id: string): Promise<ReceptionistAppointmentView | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(`/appointments/${id}`)
      if (res && res.data) {
        const apt = res.data
        return {
          appointmentId: apt.id || apt._id,
          patientId: apt.patientUserId?._id || (typeof apt.patientUserId === 'string' ? apt.patientUserId : apt.id || "patient"),
          patientName: apt.patientName || apt.patientUserId?.name || "Patient",
          patientIdentifier: apt.patientIdentifier || apt.patientId?.patientId || `PAT-${(apt.id || apt._id || "").toString().slice(-6).toUpperCase()}`,
          doctor: apt.doctor || { id: "doc_1", name: "Doctor", specialization: "General Medicine" },
          organization: apt.organization || { id: "org_1", name: "Hospital", city: "Ahmedabad" },
          date: apt.date,
          timeStr: apt.timeStr || apt.startTime,
          type: apt.consultationType || apt.type || "Physical",
          status: apt.status,
          checkInStatus: apt.status === "COMPLETED" ? null : 
                         apt.attendance === "YES" || apt.attendanceStatus === "YES" ? "Checked In" :
                         apt.attendance === "NO" || apt.attendanceStatus === "NO" ? "No-Show" :
                         "Expected"
        }
      }
    } catch (err) {
      console.error(`Error fetching appointment ${id}:`, err)
    }
    const apts = await this.getAppointments()
    return apts.find(a => a.appointmentId === id) || null
  }

  async getPatients(): Promise<ReceptionistPatientView[]> {
    const apts = await this.getAppointments()
    const patientsMap = new Map<string, ReceptionistPatientView>()

    for (const apt of apts) {
      const key = apt.patientId || apt.patientName
      if (!patientsMap.has(key)) {
        patientsMap.set(key, {
          patientId: key,
          patientName: apt.patientName,
          patientIdentifier: apt.patientIdentifier,
          email: `${apt.patientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          mobile: "+91 98765 43210",
          nextAppointment: apt.status !== "COMPLETED" && !apt.status.includes("CANCELLED") ? apt : undefined
        })
      }
    }
    
    return Array.from(patientsMap.values())
  }

  async getPatient(id: string): Promise<ReceptionistPatientView | null> {
    const patients = await this.getPatients()
    return patients.find(p => p.patientId === id) || null
  }

  async acceptAppointment(id: string): Promise<void> {
    await apiClient.patch(`/appointments/${id}/accept`)
  }

  async rejectAppointment(id: string, reason?: string): Promise<void> {
    await apiClient.patch(`/appointments/${id}/reject`, { reason: reason || "Unavailable at requested time" })
  }

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    await apiClient.patch(`/appointments/${id}/cancel`, { reason: reason || "Cancelled by Front Desk Reception" })
  }

  async checkInPatient(id: string): Promise<void> {
    await apiClient.patch(`/appointments/${id}/attendance`, { attendance: "YES" })
  }

  async markNoShow(id: string): Promise<void> {
    await apiClient.patch(`/appointments/${id}/attendance`, { attendance: "NO" })
  }

  async createWalkInAppointment(data: {
    doctorId: string
    organizationId?: string
    patientName: string
    patientPhone?: string
    date: string
    startTime: string
    type?: "Physical" | "Online"
    notes?: string
  }): Promise<any> {
    return await apiClient.post("/appointments", {
      ...data,
      type: data.type || "Physical",
      appointmentFor: "Myself"
    })
  }
}

export const receptionistService = new ReceptionistService()
