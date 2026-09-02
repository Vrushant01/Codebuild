export type OrganizationStatus = "PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "INACTIVE" | "REJECTED"

export type ListingVisibility = "VISIBLE" | "HIDDEN"

export interface AdminDashboardStats {
  organizations: number
  pendingApproval: number
  doctors: number
  receptionists: number
  patients: number
  appointments: number
}

export type AdminActivityType = 
  | "organization_submitted"
  | "organization_approved"
  | "organization_rejected"
  | "organization_suspended"
  | "organization_activated"
  | "doctor_added"
  | "receptionist_added"
  | "listing_updated"
  | "appointment_created"

export interface AdminActivityLog {
  id: string
  type: AdminActivityType
  message: string
  timestamp: string // ISO string
  entityId: string // e.g., organizationId, doctorId
}

export interface OrganizationListing {
  id: string
  organizationId: string
  visibility: ListingVisibility
  specializations: string[]
  doctorIds: string[]
  serviceIds: string[]
  telemedicineAvailable: boolean
  rating: number
  reviewCount: number
}

export type SubscriptionPlan = "Basic Listing" | "Professional Listing"
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "EXPIRED"

export interface OrganizationSubscription {
  id: string
  organizationId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  listingStatus: ListingVisibility
  startDate: string
  renewalDate: string
}
