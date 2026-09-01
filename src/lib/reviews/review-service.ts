import type { Review, ReviewSummary, ReviewStatus } from "./review-types"
import type { Appointment } from "../booking/appointment-types"
import { notificationService } from "../notifications/notification-service"

// Mock Data
let mockReviews: Review[] = [
  {
    id: "rev-1",
    patientId: "patient-1",
    doctorId: "doc_1", // Dr. Aarav Patel
    organizationId: "org-1",
    appointmentId: "apt-1",
    doctorRating: 5,
    organizationRating: 5,
    comment: "Dr. Patel was extremely thorough and took the time to listen to all my concerns. The clinic was also spotless.",
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 1.8 * 86400000).toISOString(),
    displayName: "Riya S.",
    specialization: "Cardiology",
    appointmentType: "Physical",
    organizationName: "CityCare Clinic"
  },
  {
    id: "rev-2",
    patientId: "patient-2",
    doctorId: "doc_1",
    organizationId: "org-1",
    appointmentId: "apt-2",
    doctorRating: 4,
    organizationRating: 5,
    comment: "Very smooth consultation online. Answered all my questions clearly.",
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 4.9 * 86400000).toISOString(),
    displayName: "S. K.",
    specialization: "Cardiology",
    appointmentType: "Online",
    organizationName: "CityCare Clinic"
  },
  {
    id: "rev-3",
    patientId: "patient-3",
    doctorId: "doc_1",
    organizationId: "org-1",
    appointmentId: "apt-3",
    doctorRating: 5,
    organizationRating: 4,
    comment: "Excellent experience from start to finish. The clinic staff was also very helpful.",
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 9.5 * 86400000).toISOString(),
    displayName: "Anonymous patient",
    specialization: "Cardiology",
    appointmentType: "Physical",
    organizationName: "CityCare Clinic"
  },
  {
    id: "rev-4",
    patientId: "patient-4",
    doctorId: "doc_1",
    organizationId: "org-1",
    appointmentId: "apt-4",
    doctorRating: 5,
    organizationRating: 5,
    comment: "Great online consultation. No technical issues and the doctor was very attentive.",
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    displayName: "R. Sharma",
    specialization: "Cardiology",
    appointmentType: "Online",
    organizationName: "CityCare Clinic"
  },
  {
    id: "rev-5",
    patientId: "patient-5",
    doctorId: "doc_1",
    organizationId: "org-1",
    appointmentId: "apt-5",
    doctorRating: 3,
    organizationRating: 3,
    comment: "Good doctor, but the wait time was a bit long.",
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 19 * 86400000).toISOString(),
    displayName: "A. Patel",
    specialization: "Cardiology",
    appointmentType: "Physical",
    organizationName: "CityCare Clinic"
  },
  {
    id: "rev-6",
    patientId: "PAT-8F2A91", // Current user
    doctorId: "doc_1",
    organizationId: "org-1",
    appointmentId: "apt-6",
    doctorRating: 4,
    organizationRating: 4,
    comment: "Solid advice on my diet. Happy with the visit.",
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 29 * 86400000).toISOString(),
    displayName: "Krish B.",
    specialization: "Cardiology",
    appointmentType: "Physical",
    organizationName: "CityCare Clinic"
  },
  {
    id: "rev-7",
    patientId: "patient-7",
    doctorId: "doc_1",
    organizationId: "org-1",
    appointmentId: "apt-7",
    doctorRating: 2,
    organizationRating: 4,
    comment: "Felt a bit rushed during the consultation. The facilities were nice though.",
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 39 * 86400000).toISOString(),
    displayName: "Anonymous patient",
    specialization: "Cardiology",
    appointmentType: "Physical",
    organizationName: "CityCare Clinic"
  },
  {
    id: "rev-8",
    patientId: "patient-8",
    doctorId: "doc_1",
    organizationId: "org-1",
    appointmentId: "apt-8",
    doctorRating: 5,
    organizationRating: 5,
    comment: "", // empty comment
    status: "VERIFIED",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 44 * 86400000).toISOString(),
    displayName: "Anonymous patient",
    specialization: "Cardiology",
    appointmentType: "Online",
    organizationName: "CityCare Clinic"
  }
]

class ReviewService {
  async getDoctorReviews(doctorId: string): Promise<Review[]> {
    return mockReviews
      .filter(r => r.doctorId === doctorId && r.status === "VERIFIED")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getOrganizationReviews(organizationId: string): Promise<Review[]> {
    return mockReviews
      .filter(r => r.organizationId === organizationId && r.status === "VERIFIED")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getPatientReviews(patientId: string): Promise<Review[]> {
    return mockReviews
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  async getReview(reviewId: string): Promise<Review | undefined> {
    return mockReviews.find(r => r.id === reviewId)
  }

  // Eligibility logic
  isReviewEligible(appointment: Appointment): boolean {
    if (appointment.status !== "COMPLETED") return false
    if (appointment.attendance !== "ATTENDED") return false
    if (this.hasReviewForAppointment(appointment.id)) return false
    return true
  }

  getReviewStatus(appointment: Appointment): ReviewStatus {
    if (this.hasReviewForAppointment(appointment.id)) {
      const review = mockReviews.find(r => r.appointmentId === appointment.id)
      return review?.status || "LOCKED"
    }
    if (appointment.status === "COMPLETED" && appointment.attendance === "ATTENDED") {
      return "AVAILABLE"
    }
    return "LOCKED"
  }

  hasReviewForAppointment(appointmentId: string): boolean {
    return mockReviews.some(r => r.appointmentId === appointmentId)
  }

  async submitReview(reviewData: Omit<Review, "id" | "status" | "createdAt" | "verifiedAt">): Promise<Review> {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: "SUBMITTED",
      createdAt: new Date().toISOString()
    }
    
    mockReviews = [newReview, ...mockReviews]
    return newReview
  }

  async verifyReviewMock(reviewId: string): Promise<void> {
    const idx = mockReviews.findIndex(r => r.id === reviewId)
    if (idx >= 0) {
      mockReviews[idx].status = "VERIFIED"
      mockReviews[idx].verifiedAt = new Date().toISOString()
      
      // In a real app we'd trigger notificationService.createNotification(...)
    }
  }
  
  async hideReview(reviewId: string): Promise<void> {
    const idx = mockReviews.findIndex(r => r.id === reviewId)
    if (idx >= 0) {
      mockReviews[idx].status = "HIDDEN"
    }
  }

  // Analytics Helpers
  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, rev) => acc + rev.doctorRating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  calculateRatingDistribution(reviews: Review[]) {
    const dist = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
    reviews.forEach(r => {
      if (r.doctorRating >= 1 && r.doctorRating <= 5) {
        dist[r.doctorRating.toString() as keyof typeof dist]++
      }
    })
    return dist
  }

  getFeedbackSummary(reviews: Review[]): ReviewSummary {
    const verifiedReviews = reviews.filter(r => r.status === "VERIFIED")
    return {
      averageRating: this.calculateAverageRating(verifiedReviews),
      totalReviews: reviews.length, // Include all, or just verified? Usually we show total verified
      verifiedReviews: verifiedReviews.length,
      distribution: this.calculateRatingDistribution(verifiedReviews)
    }
  }
}

export const reviewService = new ReviewService()
