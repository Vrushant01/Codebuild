export type OrganizationType = "Hospital" | "Clinic" | "Healthcare Organization"
export type AvailabilityStatus = "available" | "limited" | "full"

export interface Availability {
  status: AvailabilityStatus
  nextAvailable: string // ISO string or relative like "Today"
  availableSlots: number
}

export interface WorkingHours {
  [day: string]: string // e.g., "Monday": "9:00 AM - 6:00 PM"
}

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  address: string
  city: string
  latitude: number
  longitude: number
  distance?: number // Calculated distance in km relative to search center
  rating: number
  reviewCount: number
  specializations: string[]
  doctorIds: string[]
  availability: Availability
  onlineConsultation: boolean
  workingHours: WorkingHours
  contact: string
  image?: string
}

export interface Doctor {
  id: string
  name: string
  specialization: string
  organizationId: string
  rating: number
  reviewCount: number
  experience: number // Years
  qualifications: string[]
  consultationTypes: ("Physical" | "Online")[]
  availability: Availability
  reviewIds: string[]
  image?: string
}

export interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string // ISO string
  verifiedAppointment: boolean
  doctorId?: string
  organizationId: string
}

export interface HealthcareFilterState {
  searchQuery: string
  organizationType: OrganizationType[]
  specializations: string[]
  consultationType: "All" | "Physical" | "Online"
  availability: "All" | "Available" | "Limited" | "Fully booked"
  minRating: number
}
