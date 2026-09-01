import type { 
  ReceptionistAppointmentView, 
  ReceptionistPatientView, 
  ReceptionDashboardStats 
} from "./receptionist-types"
import type { AppointmentStatus } from "../booking/appointment-types"
import { organizationService } from "../organization/organization-service"

class ReceptionistService {
  
  // Convert standard appointments to Receptionist-safe views
  private async getSafeAppointments(): Promise<ReceptionistAppointmentView[]> {
    const appointments = await organizationService.getAppointments()
    
    return appointments.map(apt => ({
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientIdentifier: `PAT-${apt.patientId.split("_")[1].padStart(5, '0').toUpperCase()}`,
      doctor: apt.doctor,
      organization: apt.organization,
      date: apt.date,
      timeStr: apt.timeStr,
      type: apt.consultationType,
      status: apt.status,
      checkInStatus: apt.status === "COMPLETED" ? null : 
                     apt.attendance === "ATTENDED" ? "Checked In" :
                     apt.attendance === "NOT_ATTENDED" ? "No-Show" :
                     "Expected"
    }))
  }

  async getDashboardStats(): Promise<ReceptionDashboardStats> {
    const apts = await this.getSafeAppointments()
    const today = new Date().toISOString().split("T")[0]
    const todayApts = apts.filter(a => a.date === today)
    
    return {
      todayAppointments: todayApts.length,
      pendingRequests: apts.filter(a => a.status === "PENDING").length,
      confirmed: todayApts.filter(a => a.status === "CONFIRMED").length,
      cancelled: todayApts.filter(a => a.status === "CANCELLED").length
    }
  }

  async getAppointments(): Promise<ReceptionistAppointmentView[]> {
    return this.getSafeAppointments()
  }

  async getAppointment(id: string): Promise<ReceptionistAppointmentView | null> {
    const apts = await this.getSafeAppointments()
    return apts.find(a => a.appointmentId === id) || null
  }

  async getPatients(): Promise<ReceptionistPatientView[]> {
    const apts = await this.getSafeAppointments()
    
    // Extract unique patients from appointments
    const patientsMap = new Map<string, ReceptionistPatientView>()
    
    // Sort appointments chronologically to find 'next' appointment easily
    const sortedApts = [...apts].sort((a, b) => 
      new Date(`${a.date}T${a.timeStr.replace(" AM", ":00").replace(" PM", ":00")}`).getTime() - 
      new Date(`${b.date}T${b.timeStr.replace(" AM", ":00").replace(" PM", ":00")}`).getTime()
    )

    for (const apt of sortedApts) {
      if (!patientsMap.has(apt.patientId)) {
        patientsMap.set(apt.patientId, {
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientIdentifier: apt.patientIdentifier,
          email: `${apt.patientName.split(" ")[0].toLowerCase()}@example.com`,
          mobile: "+91 98765 00000",
          nextAppointment: apt.status !== "COMPLETED" && apt.status !== "CANCELLED" ? apt : undefined
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
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Accepted appointment: ${id}`)
  }

  async rejectAppointment(id: string, reason?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Rejected appointment: ${id}, reason: ${reason}`)
  }

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Cancelled appointment: ${id}, reason: ${reason}`)
  }

  async checkInPatient(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Checked in appointment: ${id}`)
  }

  async markNoShow(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Marked no-show for appointment: ${id}`)
  }

}

export const receptionistService = new ReceptionistService()
