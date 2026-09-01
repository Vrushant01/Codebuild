import type { OrganizationStats, Receptionist, HealthcareService, OrganizationDoctor, NotificationSettings, OrganizationAppointment } from "./organization-types"
import type { Organization } from "../healthcare/types"

// Mock Organization Data
const MOCK_ORGANIZATION: Organization = {
  id: "org_1",
  name: "CityCare Clinic",
  type: "Clinic",
  address: "123 Ring Road",
  city: "Ahmedabad",
  latitude: 23.0225,
  longitude: 72.5714,
  rating: 4.8,
  reviewCount: 1200,
  specializations: ["General Medicine", "Cardiology", "Dermatology", "Pediatrics"],
  doctorIds: ["doc_1", "doc_2", "doc_3"],
  availability: {
    status: "available",
    nextAvailable: "Today",
    availableSlots: 15
  },
  onlineConsultation: true,
  workingHours: {
    "Monday": "09:00 AM - 08:00 PM",
    "Tuesday": "09:00 AM - 08:00 PM",
    "Wednesday": "09:00 AM - 08:00 PM",
    "Thursday": "09:00 AM - 08:00 PM",
    "Friday": "09:00 AM - 08:00 PM",
    "Saturday": "09:00 AM - 02:00 PM",
    "Sunday": "Closed"
  },
  contact: "+91 98765 43210",
  // Specific to dashboard view
  // @ts-ignore - Adding internal fields for dashboard not present in public interface
  organizationId: "ORG-4C82K1",
  email: "care@citycare.example.com",
  website: "www.citycare.example.com",
  description: "CityCare Clinic provides comprehensive outpatient healthcare services with state-of-the-art facilities.",
  verificationStatus: "Verified"
}

// Mock Stats
const MOCK_STATS: OrganizationStats = {
  todayAppointments: 18,
  doctors: 12,
  receptionists: 4,
  services: 9,
  upcomingAppointments: 31
}

// Mock Doctors
const MOCK_DOCTORS: OrganizationDoctor[] = [
  {
    id: "doc_1",
    organizationId: "org_1",
    name: "Dr. Aarav Patel",
    specialization: "General Physician",
    rating: 4.8,
    reviewCount: 120,
    experience: 10,
    qualifications: ["MBBS", "MD"],
    consultationTypes: ["Physical", "Online"],
    availability: { status: "available", nextAvailable: "Today", availableSlots: 5 },
    reviewIds: [],
    image: "",
    status: "Active"
  },
  {
    id: "doc_2",
    organizationId: "org_1",
    name: "Dr. Meera Shah",
    specialization: "Dermatologist",
    rating: 4.9,
    reviewCount: 340,
    experience: 15,
    qualifications: ["MBBS", "MD (Dermatology)"],
    consultationTypes: ["Physical"],
    availability: { status: "limited", nextAvailable: "Tomorrow", availableSlots: 2 },
    reviewIds: [],
    image: "",
    status: "Active"
  },
  {
    id: "doc_3",
    organizationId: "org_1",
    name: "Dr. Rohan Desai",
    specialization: "Cardiologist",
    rating: 4.7,
    reviewCount: 89,
    experience: 8,
    qualifications: ["MBBS", "DM (Cardiology)"],
    consultationTypes: ["Physical", "Online"],
    availability: { status: "full", nextAvailable: "Next Week", availableSlots: 0 },
    reviewIds: [],
    image: "",
    status: "Pending" // Invited but hasn't accepted yet
  }
]

// Mock Receptionists
const MOCK_RECEPTIONISTS: Receptionist[] = [
  {
    id: "rec_1",
    organizationId: "org_1",
    name: "Ananya Shah",
    email: "ananya.s@citycare.example",
    mobile: "+91 98765 11111",
    status: "Active",
    permissions: {
      appointmentManagement: true,
      patientBooking: true,
      medicalDiagnosis: false,
      prescriptionManagement: false
    }
  },
  {
    id: "rec_2",
    organizationId: "org_1",
    name: "Priya Mehta",
    email: "priya.m@citycare.example",
    mobile: "+91 98765 22222",
    status: "Active",
    permissions: {
      appointmentManagement: true,
      patientBooking: true,
      medicalDiagnosis: false,
      prescriptionManagement: false
    }
  },
  {
    id: "rec_3",
    organizationId: "org_1",
    name: "Rahul Patel",
    email: "rahul.p@citycare.example",
    mobile: "+91 98765 33333",
    status: "Pending",
    permissions: {
      appointmentManagement: true,
      patientBooking: true,
      medicalDiagnosis: false,
      prescriptionManagement: false
    }
  }
]

// Mock Services
const MOCK_SERVICES: HealthcareService[] = [
  {
    id: "srv_1",
    organizationId: "org_1",
    name: "General Consultation",
    description: "Primary care and general medical consultations.",
    status: "Active",
    doctorIds: ["doc_1"]
  },
  {
    id: "srv_2",
    organizationId: "org_1",
    name: "Cardiology",
    description: "Heart health, ECG, and specialist cardiac care.",
    status: "Active",
    doctorIds: ["doc_3"]
  },
  {
    id: "srv_3",
    organizationId: "org_1",
    name: "Dermatology",
    description: "Skin, hair, and nail specialist treatments.",
    status: "Active",
    doctorIds: ["doc_2"]
  },
  {
    id: "srv_4",
    organizationId: "org_1",
    name: "Pediatrics",
    description: "Child health and vaccination services.",
    status: "Active",
    doctorIds: []
  },
  {
    id: "srv_5",
    organizationId: "org_1",
    name: "Telemedicine",
    description: "Online video consultations with our doctors.",
    status: "Active",
    doctorIds: ["doc_1", "doc_3"]
  }
]

// Mock Appointments
const MOCK_ORG_APPOINTMENTS: OrganizationAppointment[] = [
  {
    id: "apt_1",
    patientId: "pat_1",
    patientName: "Krish Barvaliya",
    doctor: MOCK_DOCTORS[0],
    organization: MOCK_ORGANIZATION,
    date: new Date().toISOString().split("T")[0],
    timeStr: "10:30 AM",
    status: "CONFIRMED",
    consultationType: "Physical",
    appointmentFor: "Myself",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendance: "UNKNOWN"
  },
  {
    id: "apt_2",
    patientId: "pat_2",
    patientName: "Rajiv Sharma",
    doctor: MOCK_DOCTORS[2],
    organization: MOCK_ORGANIZATION,
    date: new Date().toISOString().split("T")[0],
    timeStr: "02:00 PM",
    status: "PENDING",
    consultationType: "Physical",
    appointmentFor: "Myself",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendance: "UNKNOWN"
  },
  {
    id: "apt_3",
    patientId: "pat_3",
    patientName: "Neha Gupta",
    doctor: MOCK_DOCTORS[1],
    organization: MOCK_ORGANIZATION,
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    timeStr: "11:15 AM",
    status: "CONFIRMED",
    consultationType: "Physical",
    appointmentFor: "Myself",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendance: "UNKNOWN"
  },
  {
    id: "apt_4",
    patientId: "pat_4",
    patientName: "Amit Singh",
    doctor: MOCK_DOCTORS[0],
    organization: MOCK_ORGANIZATION,
    date: new Date().toISOString().split("T")[0],
    timeStr: "04:30 PM",
    status: "COMPLETED",
    consultationType: "Online",
    appointmentFor: "Myself",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendance: "UNKNOWN"
  }
]

class OrganizationService {
  
  // Organization Details
  async getOrganization(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { ...MOCK_ORGANIZATION }
  }

  async getDashboardStats(): Promise<OrganizationStats> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { ...MOCK_STATS }
  }

  async updateOrganization(data: Partial<Organization>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600))
    console.log("Mock saved organization:", data)
  }

  // Doctors
  async getDoctors(): Promise<OrganizationDoctor[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...MOCK_DOCTORS]
  }

  async addDoctor(data: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log("Mock added doctor:", data)
  }

  async removeDoctorAssociation(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log("Mock removed association for doctor:", id)
  }

  // Receptionists
  async getReceptionists(): Promise<Receptionist[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...MOCK_RECEPTIONISTS]
  }

  async addReceptionist(data: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log("Mock added receptionist:", data)
  }

  async suspendReceptionist(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log("Mock suspended receptionist:", id)
  }

  // Services
  async getServices(): Promise<HealthcareService[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...MOCK_SERVICES]
  }

  async addService(data: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log("Mock added service:", data)
  }

  async updateService(id: string, data: Partial<HealthcareService>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log(`Mock updated service ${id}:`, data)
  }

  async disableService(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log("Mock disabled service:", id)
  }

  // Appointments
  async getAppointments(): Promise<OrganizationAppointment[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return [...MOCK_ORG_APPOINTMENTS]
  }

  // Settings
  async getSettings(): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      appointmentAlerts: true,
      cancellationAlerts: true,
      newBookingAlerts: true,
      staffActivity: false
    }
  }

  async updateSettings(data: Partial<NotificationSettings>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log("Mock updated settings:", data)
  }
}

export const organizationService = new OrganizationService()
