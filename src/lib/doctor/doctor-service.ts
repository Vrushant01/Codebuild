import type { DoctorAppointment, DoctorStats, DoctorPatient } from "./doctor-types"
import type { AppointmentStatus } from "../booking/appointment-types"
import type { MedicalCase } from "../profile/profile-types"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ─── Mock Patients ────────────────────────────────────────────────────────────
const MOCK_PATIENTS = [
  { id: "user_001", patientId: "PAT-8F2A91", name: "Krish Barvaliya",   email: "krish@example.com",   mobile: "+91 98765 43210", preferredLanguage: "Gujarati", avatarInitials: "KB" },
  { id: "user_002", patientId: "PAT-3D7C42", name: "Priya Sharma",     email: "priya@example.com",    mobile: "+91 87654 32109", preferredLanguage: "English",  avatarInitials: "PS" },
  { id: "user_003", patientId: "PAT-6A1E85", name: "Arjun Mehta",      email: "arjun@example.com",    mobile: "+91 76543 21098", preferredLanguage: "Gujarati", avatarInitials: "AM" },
  { id: "user_004", patientId: "PAT-9B4F21", name: "Neha Patel",       email: "neha@example.com",     mobile: "+91 65432 10987", preferredLanguage: "English",  avatarInitials: "NP" },
  { id: "user_005", patientId: "PAT-2C8D63", name: "Rohan Desai",      email: "rohan@example.com",    mobile: "+91 54321 09876", preferredLanguage: "Hindi",    avatarInitials: "RD" },
  { id: "user_006", patientId: "PAT-5E9A17", name: "Sunita Joshi",     email: "sunita@example.com",   mobile: "+91 43210 98765", preferredLanguage: "Gujarati", avatarInitials: "SJ" },
]

// ─── Mock Organization ────────────────────────────────────────────────────────
const ORG_1 = {
  id: "org_1", name: "CityCare Clinic", type: "Clinic" as const, city: "Surat", rating: 4.5, reviewCount: 890,
  latitude: 21.17, longitude: 72.83, address: "123 Ring Road, Surat", specializations: ["General Physician"],
  workingHours: {}, doctorIds: ["doc_1"], onlineConsultation: true, contact: "1234567890",
  availability: { status: "available" as const, nextAvailable: "Today", availableSlots: 5 }
}

const DR_AARAV = {
  id: "doc_1", name: "Dr. Aarav Patel", specialization: "General Physician", rating: 4.8, reviewCount: 120,
  experience: 10, organizationId: "org_1", qualifications: ["MBBS", "MD"], consultationTypes: ["Physical", "Online"] as ("Physical" | "Online")[],
  availability: { status: "available" as const, nextAvailable: "Today", availableSlots: 5 }, reviewIds: [], image: ""
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const today    = new Date()
const fmtDate  = (d: Date) => d.toISOString().split("T")[0]
const daysFrom = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmtDate(d) }
const daysAgo  = (n: number) => daysFrom(-n)

// ─── Mock Case Factory ────────────────────────────────────────────────────────
const mkCase = (title: string, active = true): MedicalCase => ({
  id: `case_${Math.random().toString(36).substr(2,5)}`,
  title, startDate: daysAgo(7), status: active ? "Active" : "Resolved",
  doctorName: "Dr. Aarav Patel", symptoms: [], notes: ""
})

// ─── Shared Appointment Array ─────────────────────────────────────────────────
// Future backend replaces this with GET /api/provider/appointments
let MOCK_APPOINTMENTS: DoctorAppointment[] = [
  // TODAY ─ 3 appointments
  {
    id: "dapt_1", status: "PENDING",
    doctor: DR_AARAV, organization: ORG_1,
    date: fmtDate(today), timeStr: "09:30 AM", consultationType: "Physical", appointmentFor: "Myself",
    createdAt: new Date(today.getTime() - 20*60000).toISOString(), updatedAt: new Date().toISOString(), attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[0], currentCase: mkCase("Abdominal discomfort")
  },
  {
    id: "dapt_2", status: "CONFIRMED",
    doctor: DR_AARAV, organization: ORG_1,
    date: fmtDate(today), timeStr: "11:00 AM", consultationType: "Online", appointmentFor: "Myself",
    createdAt: daysAgo(1) + "T08:00:00Z", updatedAt: new Date().toISOString(), attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[1], currentCase: mkCase("Follow-up consultation")
  },
  {
    id: "dapt_3", status: "COMPLETED",
    doctor: DR_AARAV, organization: ORG_1,
    date: fmtDate(today), timeStr: "08:00 AM", consultationType: "Physical", appointmentFor: "Myself",
    createdAt: daysAgo(1) + "T07:00:00Z", updatedAt: new Date().toISOString(), attendance: "ATTENDED",
    patientProfile: MOCK_PATIENTS[2]
  },
  // PENDING ─ 2 more (future dates)
  {
    id: "dapt_4", status: "PENDING",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysFrom(2), timeStr: "10:30 AM", consultationType: "Online", appointmentFor: "Myself",
    createdAt: new Date(today.getTime() - 5*60000).toISOString(), updatedAt: new Date().toISOString(), attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[3], currentCase: mkCase("Diabetes follow-up")
  },
  {
    id: "dapt_5", status: "PENDING",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysFrom(3), timeStr: "02:00 PM", consultationType: "Physical", appointmentFor: "Myself",
    createdAt: new Date(today.getTime() - 45*60000).toISOString(), updatedAt: new Date().toISOString(), attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[4]
  },
  // CONFIRMED upcoming ─ 3
  {
    id: "dapt_6", status: "CONFIRMED",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysFrom(1), timeStr: "10:00 AM", consultationType: "Physical", appointmentFor: "Myself",
    createdAt: daysAgo(2) + "T10:00:00Z", updatedAt: new Date().toISOString(), attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[5]
  },
  {
    id: "dapt_7", status: "CONFIRMED",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysFrom(1), timeStr: "04:00 PM", consultationType: "Online", appointmentFor: "Myself",
    createdAt: daysAgo(3) + "T10:00:00Z", updatedAt: new Date().toISOString(), attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[0]
  },
  {
    id: "dapt_8", status: "CONFIRMED",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysFrom(4), timeStr: "09:00 AM", consultationType: "Physical", appointmentFor: "Myself",
    createdAt: daysAgo(1) + "T09:00:00Z", updatedAt: new Date().toISOString(), attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[2]
  },
  // CANCELLED ─ 2
  {
    id: "dapt_9", status: "CANCELLED",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysAgo(2), timeStr: "01:00 PM", consultationType: "Physical", appointmentFor: "Myself",
    createdAt: daysAgo(5) + "T10:00:00Z", updatedAt: daysAgo(2) + "T08:00:00Z", attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[1], cancellationReason: "Patient request", cancelledBy: "Patient"
  },
  {
    id: "dapt_10", status: "CANCELLED",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysAgo(4), timeStr: "03:00 PM", consultationType: "Online", appointmentFor: "Myself",
    createdAt: daysAgo(7) + "T10:00:00Z", updatedAt: daysAgo(4) + "T06:00:00Z", attendance: "UNKNOWN",
    patientProfile: MOCK_PATIENTS[3]
  },
  // COMPLETED past ─ 2 more
  {
    id: "dapt_11", status: "COMPLETED",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysAgo(3), timeStr: "10:30 AM", consultationType: "Physical", appointmentFor: "Myself",
    createdAt: daysAgo(7) + "T10:00:00Z", updatedAt: daysAgo(3) + "T12:00:00Z", attendance: "ATTENDED",
    patientProfile: MOCK_PATIENTS[4]
  },
  {
    id: "dapt_12", status: "COMPLETED",
    doctor: DR_AARAV, organization: ORG_1,
    date: daysAgo(5), timeStr: "11:30 AM", consultationType: "Online", appointmentFor: "Myself",
    createdAt: daysAgo(10) + "T10:00:00Z", updatedAt: daysAgo(5) + "T13:00:00Z", attendance: "ATTENDED",
    patientProfile: MOCK_PATIENTS[5]
  },
]

// ─── Check-in state (separate from appointment status) ────────────────────────
const CHECK_IN_MAP: Record<string, { status: "EXPECTED" | "CHECKED_IN" | "IN_CONSULTATION"; time?: string }> = {}

class DoctorService {

  async getDashboardStats(): Promise<DoctorStats> {
    await mockDelay(300)
    const todayStr = fmtDate(today)
    const todayApts = MOCK_APPOINTMENTS.filter(a => a.date === todayStr)
    const upcoming  = MOCK_APPOINTMENTS.filter(a => a.date > todayStr && (a.status === "CONFIRMED" || a.status === "ACCEPTED"))
    return {
      todayAppointments: todayApts.length,
      pendingRequests:   MOCK_APPOINTMENTS.filter(a => a.status === "PENDING").length,
      completedToday:    todayApts.filter(a => a.status === "COMPLETED").length,
      telemedicine:      MOCK_APPOINTMENTS.filter(a => a.consultationType === "Online" && (a.status === "CONFIRMED" || a.status === "PENDING")).length,
      upcomingCount:     upcoming.length,
    }
  }

  async getAppointments(): Promise<DoctorAppointment[]> {
    await mockDelay(400)
    return [...MOCK_APPOINTMENTS]
  }

  async getAppointmentById(id: string): Promise<DoctorAppointment | null> {
    await mockDelay(200)
    return MOCK_APPOINTMENTS.find(a => a.id === id) || null
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    await mockDelay(500)
    const idx = MOCK_APPOINTMENTS.findIndex(a => a.id === id)
    if (idx !== -1) {
      MOCK_APPOINTMENTS[idx] = { ...MOCK_APPOINTMENTS[idx], status, updatedAt: new Date().toISOString() }
    }
  }

  // PATCH /api/appointments/:id/cancel
  async cancelAppointment(id: string, reason?: string): Promise<void> {
    await mockDelay(600)
    const idx = MOCK_APPOINTMENTS.findIndex(a => a.id === id)
    if (idx !== -1) {
      MOCK_APPOINTMENTS[idx] = {
        ...MOCK_APPOINTMENTS[idx],
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledBy: "Doctor",
        updatedAt: new Date().toISOString()
      }
    }
  }

  // PATCH /api/appointments/:id/check-in
  async checkInPatient(id: string): Promise<void> {
    await mockDelay(400)
    const now = new Date()
    const hh = now.getHours().toString().padStart(2, "0")
    const mm = now.getMinutes().toString().padStart(2, "0")
    CHECK_IN_MAP[id] = { status: "CHECKED_IN", time: `${hh}:${mm}` }
  }

  getCheckInStatus(id: string): { status: "EXPECTED" | "CHECKED_IN" | "IN_CONSULTATION"; time?: string } {
    return CHECK_IN_MAP[id] || { status: "EXPECTED" }
  }

  async getPatients(): Promise<DoctorPatient[]> {
    await mockDelay(300)
    const appts = MOCK_APPOINTMENTS
    return MOCK_PATIENTS.map(p => {
      const patientAppts = appts.filter(a => a.patientProfile.id === p.id)
      const completed = patientAppts.filter(a => a.status === "COMPLETED").sort((a, b) => b.date.localeCompare(a.date))
      const upcoming  = patientAppts.filter(a => (a.status === "CONFIRMED" || a.status === "PENDING") && a.date >= fmtDate(today)).sort((a, b) => a.date.localeCompare(b.date))
      return {
        id: p.id,
        patientId: p.patientId,
        name: p.name,
        avatarInitials: p.avatarInitials,
        lastAppointmentDate:  completed[0]?.date,
        nextAppointmentDate:  upcoming[0]?.date,
        currentCaseTitle:     patientAppts.find(a => a.currentCase?.status === "Active")?.currentCase?.title,
      }
    })
  }

  // Clinical mock actions
  async updateCase(appointmentId: string, caseData: any): Promise<void> {
    await mockDelay(500)
    console.log("Mock updated case:", caseData)
  }

  async addDiagnosis(appointmentId: string, diagnosis: string): Promise<void> {
    await mockDelay(300)
    console.log("Mock added diagnosis:", diagnosis)
  }

  async addNotes(appointmentId: string, notes: string): Promise<void> {
    await mockDelay(300)
    console.log("Mock added notes:", notes)
  }

  async addMedication(appointmentId: string, medication: any): Promise<void> {
    await mockDelay(600)
    console.log("Mock added medication:", medication)
  }
}

export const doctorService = new DoctorService()
