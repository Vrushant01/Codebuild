import type { OrganizationStats, Receptionist, HealthcareService, OrganizationDoctor, NotificationSettings, OrganizationAppointment, StaffStatus, ServiceStatus } from "./organization-types"
import type { Organization } from "../healthcare/types"
import { apiClient } from "../api/apiClient"

class OrganizationService {
  async getOrganization(): Promise<any> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>("/organizations/me")
      if (res && res.data) {
        const org = res.data
        return {
          id: org.id || org._id,
          name: org.name,
          type: org.type,
          address: org.address,
          city: org.city,
          latitude: org.location?.lat || 23.0225,
          longitude: org.location?.lng || 72.5714,
          rating: org.rating || 4.8,
          reviewCount: org.reviewCount || 0,
          specializations: org.specializations || ["General Medicine"],
          doctorIds: org.doctors ? org.doctors.map((d: any) => d.id || d._id) : [],
          organizationId: `ORG-${(org.id || org._id).substring(0, 6).toUpperCase()}`,
          email: typeof org.contact === 'object' ? org.contact?.email : org.email || "care@hospital.example.com",
          contact: typeof org.contact === 'object' ? org.contact?.phone : org.contact || "+91 79 2630 1100",
          verificationStatus: "Verified"
        }
      }
    } catch (err) {}

    return {
      id: "org_1",
      name: "Ahmedabad Multi-Specialty Hospital",
      type: "Hospital",
      address: "12 University Road, Navrangpura",
      city: "Ahmedabad",
      latitude: 23.0374,
      longitude: 72.5522,
      rating: 4.9,
      reviewCount: 42,
      specializations: ["Cardiology", "General Medicine", "Orthopedics"],
      doctorIds: [],
      organizationId: "ORG-AMD001",
      email: "info@ahmedabadhospital.org",
      contact: "+91 79 2630 1100",
      verificationStatus: "Verified"
    }
  }

  async updateOrganization(data: any): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.put(`/organizations/${org.id}`, {
      name: data.name,
      type: data.type,
      description: data.description,
      address: data.address,
      city: data.city,
      location: data.location || (data.lat !== undefined && data.lng !== undefined ? { lat: Number(data.lat), lng: Number(data.lng) } : undefined),
      contact: {
        phone: data.contact,
        email: data.email
      },
      website: data.website
    })
  }

  async getDashboardStats(): Promise<OrganizationStats> {
    try {
      const org = await this.getOrganization()
      const res = await apiClient.get<{ success: boolean; data: any }>(`/organizations/${org.id}/stats`)
      if (res && res.data) {
        return {
          todayAppointments: res.data.todayAppointments || 5,
          doctors: res.data.totalDoctors || 4,
          receptionists: res.data.totalReceptionists || 1,
          services: 6,
          upcomingAppointments: res.data.pendingAppointments || 3
        }
      }
    } catch (err) {}

    return {
      todayAppointments: 5,
      doctors: 4,
      receptionists: 1,
      services: 6,
      upcomingAppointments: 3
    }
  }

  async getDoctors(): Promise<OrganizationDoctor[]> {
    try {
      const org = await this.getOrganization()
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/organizations/${org.id}/doctors`)
      if (res && res.data && res.data.length > 0) {
        return res.data.map(doc => ({
          id: doc.id || doc._id,
          organizationId: org.id,
          name: doc.name,
          specialization: doc.specialization,
          rating: doc.rating || 4.8,
          reviewCount: doc.reviewCount || 0,
          experience: doc.experienceYears || doc.experience || 5,
          qualifications: doc.qualifications || ["MBBS"],
          consultationTypes: doc.telemedicineAvailable ? ["Physical", "Online"] : ["Physical"],
          availability: { status: "available", nextAvailable: "Today", availableSlots: 5 },
          reviewIds: [],
          image: doc.avatar || "",
          status: doc.active !== false ? "Active" : "Suspended"
        }))
      }
    } catch {}

    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/doctors")
      if (res && res.data) {
        return res.data.map(doc => ({
          id: doc.id || doc._id,
          organizationId: doc.organization?.id || "org_1",
          name: doc.name,
          specialization: doc.specialization,
          rating: doc.rating || 4.8,
          reviewCount: doc.reviewCount || 10,
          experience: doc.experienceYears || 5,
          qualifications: doc.qualifications || ["MBBS"],
          consultationTypes: doc.telemedicineAvailable ? ["Physical", "Online"] : ["Physical"],
          availability: { status: "available", nextAvailable: "Today", availableSlots: 5 },
          reviewIds: [],
          image: doc.avatar || "",
          status: "Active"
        }))
      }
    } catch {}

    return []
  }

  async addDoctor(data: any): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.post(`/organizations/${org.id}/doctors`, {
      name: data.name,
      specialization: data.specialization,
      qualifications: data.qualifications,
      experienceYears: data.experience || data.experienceYears || 5,
      consultationFee: data.consultationFee || 500,
      telemedicineFee: data.telemedicineFee || 400,
      email: data.email,
      phone: data.phone,
      password: data.password || "password123"
    })
  }

  async updateDoctor(id: string, data: any): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.put(`/organizations/${org.id}/doctors/${id}`, data)
  }

  async removeDoctorAssociation(id: string): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.delete(`/organizations/${org.id}/doctors/${id}`)
  }

  async getReceptionists(): Promise<Receptionist[]> {
    try {
      const org = await this.getOrganization()
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/organizations/${org.id}/receptionists`)
      if (res && res.data && res.data.length > 0) {
        return res.data.map(r => ({
          id: r.id || r._id,
          organizationId: org.id,
          name: r.name,
          email: r.email,
          mobile: r.phone || "+91 98765 43210",
          status: (r.status === "active" ? "Active" : "Suspended") as StaffStatus,
          permissions: {
            appointmentManagement: r.permissions?.manageAppointments ?? true,
            patientBooking: r.permissions?.manageAppointments ?? true,
            medicalDiagnosis: false,
            prescriptionManagement: false
          }
        }))
      }
    } catch {}

    return []
  }

  async addReceptionist(data: any): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.post(`/organizations/${org.id}/receptionists`, {
      name: data.name,
      email: data.email,
      phone: data.mobile || data.phone,
      password: data.password || "password123",
      shift: data.shift || "Morning",
      deskLocation: data.deskLocation || "Front Desk",
      permissions: data.permissions
    })
  }

  async updateReceptionist(id: string, data: any): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.put(`/organizations/${org.id}/receptionists/${id}`, data)
  }

  async removeReceptionist(id: string): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.delete(`/organizations/${org.id}/receptionists/${id}`)
  }

  async suspendReceptionist(id: string): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.put(`/organizations/${org.id}/receptionists/${id}`, { status: "inactive" })
  }

  async getServices(): Promise<HealthcareService[]> {
    try {
      const org = await this.getOrganization()
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/organizations/${org.id}/services`)
      if (res && res.data && res.data.length > 0) {
        return res.data.map(s => ({
          id: s.id || s._id,
          organizationId: org.id,
          name: s.name,
          description: s.description || "",
          status: (s.status === "Inactive" ? "Inactive" : "Active") as ServiceStatus,
          doctorIds: s.doctorIds || []
        }))
      }
    } catch (err) {}

    return [
      { id: "srv_1", organizationId: "org_1", name: "Cardiac ECG & TMT Testing", description: "Standard diagnostic cardiac assessment", status: "Active", doctorIds: ["doc_1"] },
      { id: "srv_2", organizationId: "org_1", name: "General Health Checkup", description: "Comprehensive outpatient screening", status: "Active", doctorIds: ["doc_1"] }
    ]
  }

  async addService(data: any): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.post(`/organizations/${org.id}/services`, {
      name: data.name,
      description: data.description,
      price: data.price || 500,
      status: "Active",
      doctorIds: data.doctorIds || []
    })
  }

  async updateService(id: string, data: Partial<HealthcareService>): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.put(`/organizations/${org.id}/services/${id}`, data)
  }

  async disableService(id: string): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.patch(`/organizations/${org.id}/services/${id}/toggle`, {})
  }

  async getAppointments(): Promise<OrganizationAppointment[]> {
    try {
      const org = await this.getOrganization()
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/organizations/${org.id}/appointments`)
      if (res && res.data && res.data.length > 0) {
        return res.data.map(apt => ({
          id: apt.id || apt._id,
          patientId: apt.patientId || apt.patientUserId || "patient",
          patientName: apt.patientName || "Patient",
          doctor: apt.doctor || { id: "doc_1", name: "Doctor", specialization: "General", organizationId: org.id, rating: 4.8, reviewCount: 0, experience: 5, qualifications: ["MBBS"], consultationTypes: ["Physical"], availability: { status: "available", nextAvailable: "Today", availableSlots: 5 }, reviewIds: [] },
          organization: apt.organization || { id: org.id, name: org.name, type: org.type, address: org.address, city: org.city, latitude: 23.03, longitude: 72.55, rating: 4.8, reviewCount: 10, specializations: ["General"], doctorIds: [], availability: { status: "available", nextAvailable: "Today", availableSlots: 10 }, onlineConsultation: true, workingHours: {}, contact: "" },
          date: apt.date,
          timeStr: apt.timeStr || apt.startTime,
          consultationType: apt.consultationType || apt.type || "Physical",
          appointmentFor: apt.appointmentFor || "Myself",
          status: apt.status,
          attendance: (apt.attendanceStatus === "YES" ? "ATTENDED" : "UNKNOWN") as any,
          createdAt: apt.createdAt || new Date().toISOString(),
          updatedAt: apt.updatedAt || new Date().toISOString()
        }))
      }
    } catch (err) {}

    return []
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const org = await this.getOrganization()
      const res = await apiClient.get<{ success: boolean; data: any }>(`/organizations/${org.id}/settings`)
      if (res && res.data) {
        return {
          appointmentAlerts: res.data.appointmentAlerts ?? true,
          cancellationAlerts: res.data.cancellationAlerts ?? true,
          newBookingAlerts: res.data.newBookingAlerts ?? true,
          staffActivity: res.data.staffActivity ?? false
        }
      }
    } catch {}

    return {
      appointmentAlerts: true,
      cancellationAlerts: true,
      newBookingAlerts: true,
      staffActivity: false
    }
  }

  async updateSettings(data: Partial<NotificationSettings>): Promise<void> {
    const org = await this.getOrganization()
    await apiClient.put(`/organizations/${org.id}/settings`, data)
  }
}

export const organizationService = new OrganizationService()
