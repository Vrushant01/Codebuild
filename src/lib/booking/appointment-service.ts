import type { AppointmentRequest, Appointment, DailyAvailability, TimeSlot, PatientType, AttendanceStatus, AppointmentStatus } from "./appointment-types"
import { healthcareService } from "../healthcare/healthcare-service"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class AppointmentError extends Error {
  code: "SLOT_CONFLICT" | "SERVER_ERROR"

  constructor(message: string, code: "SLOT_CONFLICT" | "SERVER_ERROR") {
    super(message)
    this.name = "AppointmentError"
    this.code = code
  }
}

import { notificationService } from "./notification-service"

class AppointmentService {
  private appointments: Appointment[] = []
  
  constructor() {
    this.initializeMockData()
  }

  private async initializeMockData() {
    // Generate some mock history ensuring we have doctors & orgs from healthcare-service
    // We will do this lazily or statically. For frontend demo, we'll create some static ones.
    const org1 = (await healthcareService.getOrganization("org_1"))!
    const doc1 = (await healthcareService.getDoctor("doc_1"))!
    
    const org2 = (await healthcareService.getOrganization("org_4"))!
    const doc5 = (await healthcareService.getDoctor("doc_5"))!

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const lastMonth = new Date(today)
    lastMonth.setDate(lastMonth.getDate() - 30)

    const baseApt = {
      appointmentFor: "Myself" as PatientType,
      createdAt: lastMonth.toISOString(),
      updatedAt: lastMonth.toISOString(),
      attendance: "UNKNOWN" as AttendanceStatus
    }

    if (org1 && doc1 && org2 && doc5) {
      this.appointments = [
        // 1. Confirmed Physical (Upcoming)
        {
          ...baseApt,
          id: "mock_apt_1",
          status: "CONFIRMED",
          doctor: doc1,
          organization: org1,
          date: nextWeek.toISOString().split("T")[0],
          timeStr: "10:30 AM",
          consultationType: "Physical",
          createdAt: today.toISOString(),
          updatedAt: today.toISOString()
        },
        // 2. Confirmed Online (Upcoming, maybe tomorrow)
        {
          ...baseApt,
          id: "mock_apt_2",
          status: "CONFIRMED",
          doctor: doc1,
          organization: org1,
          date: tomorrow.toISOString().split("T")[0],
          timeStr: "02:00 PM",
          consultationType: "Online"
        },
        // 3. Pending Physical
        {
          ...baseApt,
          id: "mock_apt_3",
          status: "PENDING",
          doctor: doc5,
          organization: org2,
          date: nextWeek.toISOString().split("T")[0],
          timeStr: "09:00 AM",
          consultationType: "Physical"
        },
        // 4. Completed Physical
        {
          ...baseApt,
          id: "mock_apt_4",
          status: "COMPLETED",
          doctor: doc5,
          organization: org2,
          date: lastMonth.toISOString().split("T")[0],
          timeStr: "11:00 AM",
          consultationType: "Physical"
        },
        // 5. Cancelled Online
        {
          ...baseApt,
          id: "mock_apt_5",
          status: "CANCELLED",
          doctor: doc1,
          organization: org1,
          date: lastMonth.toISOString().split("T")[0],
          timeStr: "04:00 PM",
          consultationType: "Online",
          cancellationReason: "Scheduling conflict",
          cancelledBy: "Patient"
        },
        // 6. Rejected
        {
          ...baseApt,
          id: "mock_apt_6",
          status: "REJECTED",
          doctor: doc5,
          organization: org2,
          date: lastMonth.toISOString().split("T")[0],
          timeStr: "01:00 PM",
          consultationType: "Physical"
        }
      ]
    }
  }

  // Generates 7 days of realistic mock availability from a given start date
  async getAvailability(doctorId: string, startDateStr: string, consultationType: "Physical" | "Online"): Promise<DailyAvailability[]> {
    await mockDelay(600) // Simulate network

    const results: DailyAvailability[] = []
    const start = new Date(startDateStr)

    for (let i = 0; i < 7; i++) {
      const current = new Date(start)
      current.setDate(start.getDate() + i)
      const dateStr = current.toISOString().split("T")[0]
      const dayOfWeek = current.getDay()

      if (dayOfWeek === 0) { // Sunday
        results.push({ date: dateStr, isAvailable: false, slots: [] })
        continue
      }

      if (dayOfWeek === 4) { // Thursday (simulated FULL day)
        const slots = this.generateSlots("FULL", consultationType)
        results.push({ date: dateStr, isAvailable: true, slots })
        continue
      }

      const slots = this.generateSlots("MIXED", consultationType)
      results.push({ date: dateStr, isAvailable: true, slots })
    }

    return results
  }

  private generateSlots(mode: "FULL" | "MIXED", type: "Physical" | "Online"): TimeSlot[] {
    const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", "02:00 PM", "04:00 PM", "04:30 PM"]
    
    return times.map((time, index) => {
      let status: "AVAILABLE" | "BOOKED" | "FULL" = "AVAILABLE"
      
      if (mode === "FULL") {
        status = "FULL"
      } else {
        const hash = time.charCodeAt(0) + time.charCodeAt(1) + index
        if (hash % 3 === 0) status = "BOOKED"
        if (hash % 5 === 0) status = "FULL"
      }

      return {
        id: `slot_${time.replace(/[: ]/g, "_")}`,
        timeStr: time,
        status
      }
    })
  }

  async submitAppointmentRequest(req: AppointmentRequest): Promise<Appointment> {
    await mockDelay(1200)

    if (Math.random() < 0.1) {
      throw new AppointmentError("That time was just taken. Another patient booked this slot before your request was confirmed.", "SLOT_CONFLICT")
    }

    const doc = await healthcareService.getDoctor(req.doctorId)
    const org = await healthcareService.getOrganization(req.organizationId)

    if (!doc || !org) {
      throw new AppointmentError("Doctor or Organization not found", "SERVER_ERROR")
    }

    const newApt: Appointment = {
      id: `apt_${Math.random().toString(36).substr(2, 9)}`,
      status: "PENDING",
      doctor: doc,
      organization: org,
      date: req.date,
      timeStr: req.timeStr,
      consultationType: req.consultationType,
      appointmentFor: req.appointmentFor,
      familyMemberName: req.familyMemberName,
      relationship: req.relationship,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attendance: "UNKNOWN"
    }

    this.appointments.unshift(newApt)
    notificationService.notifyAppointmentRequested(newApt)
    return newApt
  }

  async getAppointments(): Promise<Appointment[]> {
    await mockDelay(400)
    return [...this.appointments]
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    await mockDelay(300)
    return this.appointments.find(a => a.id === id)
  }

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    await mockDelay(800)
    const idx = this.appointments.findIndex(a => a.id === id)
    if (idx === -1) throw new AppointmentError("Appointment not found", "SERVER_ERROR")
    
    const apt = { ...this.appointments[idx] }
    if (apt.status === "COMPLETED" || apt.status === "CANCELLED" || apt.status === "REJECTED") {
       throw new AppointmentError("Cannot cancel this appointment", "SERVER_ERROR")
    }

    apt.status = "CANCELLED"
    apt.cancellationReason = reason
    apt.cancelledBy = "Patient"
    apt.updatedAt = new Date().toISOString()
    
    this.appointments[idx] = apt
    notificationService.notifyAppointmentCancelled(apt)
    return apt
  }

  async confirmAttendance(id: string, attended: boolean): Promise<Appointment> {
    await mockDelay(500)
    const idx = this.appointments.findIndex(a => a.id === id)
    if (idx === -1) throw new AppointmentError("Appointment not found", "SERVER_ERROR")
    
    const apt = { ...this.appointments[idx] }
    apt.attendance = attended ? "ATTENDED" : "NOT_ATTENDED"
    apt.updatedAt = new Date().toISOString()
    
    this.appointments[idx] = apt
    return apt
  }

  // Developer mock action to move state forward for demo
  async dev_simulateStatusChange(id: string, newStatus: AppointmentStatus): Promise<Appointment> {
    const idx = this.appointments.findIndex(a => a.id === id)
    if (idx !== -1) {
       this.appointments[idx].status = newStatus
       this.appointments[idx].updatedAt = new Date().toISOString()
       
       if (newStatus === "CONFIRMED") notificationService.notifyAppointmentConfirmed(this.appointments[idx])
       if (newStatus === "REJECTED") notificationService.notifyAppointmentRejected(this.appointments[idx])
       
       return this.appointments[idx]
    }
    throw new Error("Not found")
  }
}

export const appointmentService = new AppointmentService()
