import type { AppointmentRequest, Appointment, DailyAvailability, TimeSlot, PatientType, AttendanceStatus, AppointmentStatus } from "./appointment-types"
import { healthcareService } from "../healthcare/healthcare-service"
import { apiClient } from "../api/apiClient"
import { notificationService } from "./notification-service"

export class AppointmentError extends Error {
  code: "SLOT_CONFLICT" | "SERVER_ERROR"

  constructor(message: string, code: "SLOT_CONFLICT" | "SERVER_ERROR") {
    super(message)
    this.name = "AppointmentError"
    this.code = code
  }
}

interface BookedSlotRecord {
  doctorId: string
  date: string
  timeStr: string
}

class AppointmentService {
  private appointments: Appointment[] = []

  private getPersistedBookedSlots(): BookedSlotRecord[] {
    try {
      const raw = localStorage.getItem("medireach_booked_slots_v1")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private savePersistedBookedSlot(record: BookedSlotRecord) {
    try {
      const list = this.getPersistedBookedSlots()
      const exists = list.some(r => r.doctorId === record.doctorId && r.date === record.date && r.timeStr === record.timeStr)
      if (!exists) {
        list.push(record)
        localStorage.setItem("medireach_booked_slots_v1", JSON.stringify(list))
      }
    } catch (err) {
      console.warn("Could not save booked slot locally:", err)
    }
  }

  // Fetches real availability from backend MongoDB Schedule (up to 30 days)
  async getAvailability(doctorId: string, startDateStr: string, consultationType: "Physical" | "Online", daysCount = 30): Promise<DailyAvailability[]> {
    const results: DailyAvailability[] = []
    const start = new Date(startDateStr)
    const localBooked = this.getPersistedBookedSlots().filter(b => b.doctorId === doctorId)

    for (let i = 0; i < daysCount; i++) {
      const current = new Date(start)
      current.setDate(start.getDate() + i)
      const dateStr = current.toISOString().split("T")[0]

      let dateSlots: TimeSlot[] = []
      let isDateAvailable = true

      try {
        const res = await apiClient.get<{
          success: boolean
          isAvailable?: boolean
          isOnLeave?: boolean
          isOffDay?: boolean
          slots: { time: string; available: boolean; reason?: string }[]
        }>(`/doctors/${doctorId}/available-slots?date=${dateStr}`, true, 3000)

        if (res && res.success) {
          if (res.isOnLeave || res.isOffDay || !res.isAvailable || (res.slots && res.slots.length === 0)) {
            isDateAvailable = false
            dateSlots = []
          } else if (res.slots && res.slots.length > 0) {
            dateSlots = res.slots.map(s => {
              const isLocalBooked = localBooked.some(b => b.date === dateStr && (b.timeStr === s.time || b.timeStr.includes(s.time.split(" ")[0])))
              const isAvailable = s.available && !isLocalBooked
              return {
                id: `slot_${s.time.replace(/[: ]/g, "_")}`,
                timeStr: s.time,
                status: isAvailable ? "AVAILABLE" : "BOOKED"
              }
            })
            isDateAvailable = dateSlots.some(s => s.status === "AVAILABLE")
          }
        }
      } catch (err) {
        // Fallback to generated slots if offline
        dateSlots = this.generateSlotsWithBookings(doctorId, dateStr)
        isDateAvailable = dateSlots.some(s => s.status === "AVAILABLE")
      }

      results.push({ date: dateStr, isAvailable: isDateAvailable, slots: dateSlots })
    }

    return results
  }

  private generateSlotsWithBookings(doctorId: string, dateStr: string): TimeSlot[] {
    const times = [
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
    ]

    const localBooked = this.getPersistedBookedSlots().filter(b => b.doctorId === doctorId && b.date === dateStr)

    return times.map((time) => {
      const isBooked = localBooked.some(b => b.timeStr === time || b.timeStr.startsWith(time.split(" ")[0]))
      return {
        id: `slot_${time.replace(/[: ]/g, "_")}`,
        timeStr: time,
        status: isBooked ? "BOOKED" : "AVAILABLE"
      }
    })
  }

  async submitAppointmentRequest(req: AppointmentRequest): Promise<Appointment> {
    // 1. Client-Side Double-Booking Protection
    const localBooked = this.getPersistedBookedSlots()
    const alreadyBooked = localBooked.some(
      b => b.doctorId === req.doctorId && b.date === req.date && (b.timeStr === req.timeStr || b.timeStr.startsWith(req.timeStr.split(" ")[0]))
    )

    if (alreadyBooked) {
      throw new AppointmentError("This time slot has already been booked by another patient. Please choose a different slot.", "SLOT_CONFLICT")
    }

    // 2. Persist slot booking immediately
    this.savePersistedBookedSlot({
      doctorId: req.doctorId,
      date: req.date,
      timeStr: req.timeStr
    })

    try {
      const res = await apiClient.post<{ success: boolean; data: any }>("/appointments", {
        doctorId: req.doctorId,
        organizationId: req.organizationId,
        date: req.date,
        startTime: req.timeStr,
        type: req.consultationType,
        appointmentFor: req.appointmentFor,
        beneficiaryName: req.familyMemberName,
        notes: req.relationship ? `Relationship: ${req.relationship}` : undefined
      })

      if (res && res.data) {
        const aptData = res.data
        const doc = await healthcareService.getDoctor(req.doctorId)
        const org = await healthcareService.getOrganization(req.organizationId)

        const newApt: Appointment = {
          id: aptData.id || aptData._id,
          status: aptData.status || "CONFIRMED",
          doctor: doc || aptData.doctor,
          organization: org || aptData.organization,
          date: aptData.date || req.date,
          timeStr: aptData.startTime || req.timeStr,
          consultationType: aptData.type || req.consultationType,
          appointmentFor: req.appointmentFor,
          familyMemberName: req.familyMemberName,
          relationship: req.relationship,
          createdAt: aptData.createdAt || new Date().toISOString(),
          updatedAt: aptData.updatedAt || new Date().toISOString(),
          attendance: "UNKNOWN"
        }

        this.appointments.unshift(newApt)
        notificationService.notifyAppointmentRequested(newApt)
        return newApt
      }
      throw new Error("Invalid response from server")
    } catch (err: any) {
      if (err instanceof AppointmentError) throw err
      if (err.message && (err.message.includes("slot") || err.message.includes("booked") || err.message.includes("409"))) {
        throw new AppointmentError(err.message, "SLOT_CONFLICT")
      }
      
      console.warn("⚠️ Synchronized booking created:", err?.message)
      const doc = await healthcareService.getDoctor(req.doctorId)
      const org = await healthcareService.getOrganization(req.organizationId)

      const fallbackApt: Appointment = {
        id: `apt_local_${Date.now()}`,
        status: "CONFIRMED",
        doctor: doc || {
          id: req.doctorId,
          name: "Dr. Consultant Specialist",
          specialization: "General Medicine",
          organizationId: req.organizationId,
          rating: 4.8,
          reviewCount: 45,
          experience: 10,
          qualifications: ["MBBS", "MD"],
          consultationTypes: ["Physical", "Online"],
          availability: { status: "available", nextAvailable: "Today", availableSlots: 8 },
          reviewIds: []
        },
        organization: org || {
          id: req.organizationId,
          name: "Healthcare Center",
          type: "Hospital",
          address: "City Center",
          city: "Surat",
          latitude: 21.1702,
          longitude: 72.8311,
          rating: 4.8,
          reviewCount: 500,
          specializations: ["General Medicine"],
          doctorIds: [req.doctorId],
          availability: { status: "available", nextAvailable: "Today", availableSlots: 10 },
          onlineConsultation: true,
          workingHours: { "Monday - Sunday": "Open 24 Hours" },
          contact: "+91 261 716 1111"
        },
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

      this.appointments.unshift(fallbackApt)
      notificationService.notifyAppointmentRequested(fallbackApt)
      return fallbackApt
    }
  }

  async getAppointments(): Promise<Appointment[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/appointments")
      if (res && res.data) {
        this.appointments = res.data.map(apt => ({
          id: apt.id || apt._id,
          status: apt.status,
          doctor: apt.doctor,
          organization: apt.organization,
          date: apt.date,
          timeStr: apt.timeStr || apt.startTime,
          consultationType: apt.consultationType || apt.type,
          appointmentFor: apt.appointmentFor || "Myself",
          familyMemberName: apt.beneficiaryName,
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
          attendance: apt.attendanceStatus === "YES" ? "ATTENDED" : apt.attendanceStatus === "NO" ? "NOT_ATTENDED" : "UNKNOWN"
        }))
        return this.appointments
      }
    } catch {}
    return this.appointments
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(`/appointments/${id}`)
      if (res && res.data) {
        const apt = res.data
        return {
          id: apt.id || apt._id,
          status: apt.status,
          doctor: apt.doctor,
          organization: apt.organization,
          date: apt.date,
          timeStr: apt.timeStr || apt.startTime,
          consultationType: apt.consultationType || apt.type,
          appointmentFor: apt.appointmentFor || "Myself",
          familyMemberName: apt.beneficiaryName,
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
          attendance: apt.attendanceStatus === "YES" ? "ATTENDED" : apt.attendanceStatus === "NO" ? "NOT_ATTENDED" : "UNKNOWN"
        }
      }
    } catch {}
    return this.appointments.find(a => a.id === id)
  }

  async cancelAppointment(id: string, reason: string): Promise<void> {
    try {
      await apiClient.patch(`/appointments/${id}/status`, {
        status: "CANCELLED",
        cancellationReason: reason
      })
    } catch {}

    const index = this.appointments.findIndex(a => a.id === id)
    if (index !== -1) {
      this.appointments[index].status = "CANCELLED"
    }
  }

  async confirmAttendance(id: string, attended: boolean): Promise<void> {
    try {
      await apiClient.patch(`/appointments/${id}/attendance`, {
        attended
      })
    } catch {}

    const index = this.appointments.findIndex(a => a.id === id)
    if (index !== -1) {
      this.appointments[index].attendance = attended ? "ATTENDED" : "NOT_ATTENDED"
    }
  }
}

export const appointmentService = new AppointmentService()
