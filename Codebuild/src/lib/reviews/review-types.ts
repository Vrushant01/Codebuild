export type ReviewStatus = "LOCKED" | "AVAILABLE" | "SUBMITTED" | "VERIFIED" | "PENDING" | "HIDDEN"

export interface Review {
  id: string
  patientId: string
  doctorId: string
  organizationId: string
  appointmentId: string
  doctorRating: number
  organizationRating: number
  comment: string
  status: ReviewStatus
  createdAt: string
  verifiedAt?: string
  
  // Frontend Display Metadata (denormalized for UI convenience without a real backend)
  displayName: string
  specialization?: string
  appointmentType?: string
  organizationName?: string
}

export interface ReviewSummary {
  averageRating: number // Calculated based on doctorRating for doctor views
  totalReviews: number
  verifiedReviews: number
  distribution: {
    "5": number
    "4": number
    "3": number
    "2": number
    "1": number
  }
}
