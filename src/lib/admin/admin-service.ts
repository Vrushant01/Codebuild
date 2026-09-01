import { organizationService } from "../organization/organization-service"
import { doctorService } from "../doctor/doctor-service"
import { receptionistService } from "../receptionist/receptionist-service"
import { appointmentService } from "../booking/appointment-service"
import type { 
  AdminDashboardStats, 
  OrganizationStatus, 
  AdminActivityLog, 
  OrganizationListing,
  OrganizationSubscription
} from "./admin-types"

// We create mock state here to hold the admin-specific overrides
const adminMockState = {
  orgStatuses: {
    "org_1": "ACTIVE" as OrganizationStatus,
  } as Record<string, OrganizationStatus>,
  
  activities: [
    {
      id: "act_1",
      type: "organization_submitted",
      message: "Sunrise Hospital submitted an organization profile.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      entityId: "org_2"
    },
    {
      id: "act_2",
      type: "organization_activated",
      message: "CityCare Clinic listing activated.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      entityId: "org_1"
    }
  ] as AdminActivityLog[],
  
  listings: [
    {
      id: "list_1",
      organizationId: "org_1",
      visibility: "VISIBLE",
      specializations: ["General Medicine", "Cardiology"],
      doctorIds: ["doc_1", "doc_3"],
      serviceIds: ["srv_1", "srv_2"],
      telemedicineAvailable: true,
      rating: 4.8,
      reviewCount: 1200
    }
  ] as OrganizationListing[],
  
  subscriptions: [
    {
      id: "sub_1",
      organizationId: "org_1",
      plan: "Professional Listing",
      status: "ACTIVE",
      listingStatus: "VISIBLE",
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      renewalDate: new Date(Date.now() + 335 * 86400000).toISOString()
    }
  ] as OrganizationSubscription[]
}

// Add a couple of mock organizations specifically for admin to test the different statuses
const MOCK_EXTRA_ORGS = [
  {
    id: "org_2",
    name: "Sunrise Hospital",
    type: "Hospital",
    address: "456 Main St",
    city: "Ahmedabad",
    latitude: 23.03,
    longitude: 72.58,
    rating: 0,
    reviewCount: 0,
    specializations: ["General Surgery", "Orthopedics"],
    doctorIds: [],
    availability: { status: "available", nextAvailable: "Today", availableSlots: 20 },
    onlineConsultation: false,
    workingHours: { "Monday": "24 Hours" },
    contact: "+91 98765 00001",
    organizationId: "ORG-S123",
    email: "contact@sunrise.example",
    verificationStatus: "Pending",
    status: "PENDING"
  },
  {
    id: "org_3",
    name: "Wellness Health Center",
    type: "Clinic",
    address: "789 Health Ave",
    city: "Surat",
    latitude: 21.1702,
    longitude: 72.8311,
    rating: 4.5,
    reviewCount: 120,
    specializations: ["Physiotherapy", "Nutrition"],
    doctorIds: [],
    availability: { status: "available", nextAvailable: "Today", availableSlots: 5 },
    onlineConsultation: true,
    workingHours: { "Monday": "09:00 AM - 05:00 PM" },
    contact: "+91 98765 00002",
    organizationId: "ORG-W456",
    email: "hello@wellness.example",
    verificationStatus: "Verified",
    status: "APPROVED"
  },
  {
    id: "org_4",
    name: "CarePlus Clinic",
    type: "Clinic",
    address: "101 Care Ln",
    city: "Vadodara",
    latitude: 22.3072,
    longitude: 73.1812,
    rating: 4.2,
    reviewCount: 45,
    specializations: ["General Medicine"],
    doctorIds: [],
    availability: { status: "limited", nextAvailable: "Tomorrow", availableSlots: 2 },
    onlineConsultation: false,
    workingHours: { "Monday": "10:00 AM - 06:00 PM" },
    contact: "+91 98765 00003",
    organizationId: "ORG-C789",
    email: "info@careplus.example",
    verificationStatus: "Suspended",
    status: "SUSPENDED"
  }
]

class AdminService {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 600))
    const orgs = await this.getOrganizations()
    return {
      organizations: orgs.length,
      pendingApproval: orgs.filter(o => o.status === "PENDING").length,
      doctors: 126,
      receptionists: 34,
      patients: 2840,
      appointments: 1126
    }
  }

  async getOrganizations(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    const baseOrg = await organizationService.getOrganization()
    const enrichedBaseOrg = {
      ...baseOrg,
      status: adminMockState.orgStatuses[baseOrg.id] || "ACTIVE"
    }
    
    // Apply dynamic statuses to extra orgs too if they were changed
    const extraOrgs = MOCK_EXTRA_ORGS.map(org => ({
      ...org,
      status: adminMockState.orgStatuses[org.id] || org.status
    }))
    
    return [enrichedBaseOrg, ...extraOrgs]
  }

  async getOrganization(id: string): Promise<any> {
    const orgs = await this.getOrganizations()
    const org = orgs.find(o => o.id === id)
    if (!org) throw new Error("Organization not found")
    return org
  }

  async approveOrganization(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600))
    adminMockState.orgStatuses[id] = "APPROVED"
    this.addActivity("organization_approved", `Approved organization ${id}`, id)
  }

  async rejectOrganization(id: string, reason?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600))
    adminMockState.orgStatuses[id] = "REJECTED"
    this.addActivity("organization_rejected", `Rejected organization ${id}${reason ? ' - ' + reason : ''}`, id)
  }

  async activateOrganization(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600))
    adminMockState.orgStatuses[id] = "ACTIVE"
    this.addActivity("organization_activated", `Activated organization ${id}`, id)
  }

  async suspendOrganization(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600))
    adminMockState.orgStatuses[id] = "SUSPENDED"
    this.addActivity("organization_suspended", `Suspended organization ${id}`, id)
  }
  
  async deactivateOrganization(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600))
    adminMockState.orgStatuses[id] = "INACTIVE"
  }

  async getDoctors(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    // We just return the shared doctors, perhaps fetching from organizationService or doctorService
    return organizationService.getDoctors()
  }

  async getReceptionists(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return organizationService.getReceptionists()
  }

  async getPatients(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return doctorService.getPatients() // Using doctor's mock patients for now
  }

  async getAppointments(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return organizationService.getAppointments()
  }

  async getListings(): Promise<OrganizationListing[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...adminMockState.listings]
  }

  async updateListingVisibility(id: string, visibility: "VISIBLE" | "HIDDEN"): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    const listing = adminMockState.listings.find(l => l.id === id)
    if (listing) {
      listing.visibility = visibility
      this.addActivity("listing_updated", `Listing visibility updated to ${visibility} for ${listing.organizationId}`, listing.organizationId)
    }
  }

  async getSubscriptions(): Promise<OrganizationSubscription[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...adminMockState.subscriptions]
  }

  async getActivity(): Promise<AdminActivityLog[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Return sorted newest first
    return [...adminMockState.activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
  
  private addActivity(type: any, message: string, entityId: string) {
    adminMockState.activities.push({
      id: `act_${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      entityId
    })
  }
}

export const adminService = new AdminService()
