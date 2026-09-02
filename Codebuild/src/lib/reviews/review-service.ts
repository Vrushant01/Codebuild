import type { Review, ReviewSummary, ReviewStatus } from "./review-types"
import type { Appointment } from "../booking/appointment-types"
import { apiClient } from "../api/apiClient"

class ReviewService {
  private getPersistedReviews(): Review[] {
    try {
      const raw = localStorage.getItem("medireach_patient_reviews_v1")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private savePersistedReview(review: Review) {
    try {
      const list = this.getPersistedReviews()
      const filtered = list.filter(r => r.id !== review.id)
      filtered.unshift(review)
      localStorage.setItem("medireach_patient_reviews_v1", JSON.stringify(filtered))
    } catch (e) {
      console.warn("Could not save review locally:", e)
    }
  }

  async getDoctorReviews(doctorId: string): Promise<Review[]> {
    const localRevs: Review[] = this.getPersistedReviews()
    let serverRevs: Review[] = []

    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/reviews?doctorId=${doctorId}`)
      if (res && res.data && res.data.length > 0) {
        serverRevs = res.data.map(r => ({
          id: r.id || r._id,
          patientId: r.patientUserId || "patient",
          doctorId: r.doctorId?._id || r.doctorId || doctorId,
          organizationId: r.organizationId?._id || r.organizationId || "org",
          appointmentId: r.appointmentId || `apt_${r._id}`,
          doctorRating: Number(r.rating) || 5,
          organizationRating: Number(r.rating) || 5,
          comment: r.comment || "",
          status: "VERIFIED" as ReviewStatus,
          createdAt: r.createdAt || new Date().toISOString(),
          displayName: r.author || r.patientName || "Verified Patient",
          specialization: r.doctorId?.specialization || "Medicine",
          appointmentType: "Physical",
          organizationName: r.organizationId?.name || "Healthcare Center"
        }))
      }
    } catch (err) {
      console.warn("Could not fetch server doctor reviews:", err)
    }

    const combined: Review[] = [...serverRevs]
    for (const lr of localRevs) {
      const alreadyIncluded = combined.some(cr => cr.id === lr.id || (cr.appointmentId && cr.appointmentId === lr.appointmentId))
      if (!alreadyIncluded) {
        combined.unshift(lr)
      }
    }

    return combined
  }

  async getOrganizationReviews(organizationId: string): Promise<Review[]> {
    const localRevs: Review[] = this.getPersistedReviews().filter(r => r.organizationId === organizationId)
    let serverRevs: Review[] = []

    try {
      // Try organization feedback endpoint first
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/organizations/${organizationId}/feedback`)
      if (res && res.data && res.data.length > 0) {
        serverRevs = res.data.map(r => ({
          id: r.id || r._id,
          patientId: r.patientUserId?._id || r.patientUserId || r.patientId || "patient",
          doctorId: r.doctorId?._id || r.doctorId,
          organizationId: r.organizationId?._id || r.organizationId || organizationId,
          appointmentId: r.appointmentId,
          doctorRating: Number(r.rating || r.doctorRating) || 5,
          organizationRating: Number(r.rating || r.organizationRating) || 5,
          comment: r.comment,
          status: "VERIFIED" as ReviewStatus,
          createdAt: r.createdAt || new Date().toISOString(),
          displayName: (r.patientUserId && typeof r.patientUserId === 'object' ? r.patientUserId.name : null) || r.author || r.patientName || r.displayName || "Verified Patient",
          specialization: (r.doctorId && typeof r.doctorId === 'object' ? r.doctorId.specialization : null) || r.doctorSpecialization || "Medicine",
          appointmentType: r.appointmentType || "Physical",
          organizationName: (r.organizationId && typeof r.organizationId === 'object' ? r.organizationId.name : null) || r.organizationName || "Clinic"
        }))
      }
    } catch (err) {}

    // If server reviews are empty, try fallback /reviews endpoint
    if (serverRevs.length === 0) {
      try {
        const res = await apiClient.get<{ success: boolean; data: any[] }>(`/reviews?organizationId=${organizationId}`)
        if (res && res.data && res.data.length > 0) {
          serverRevs = res.data.map(r => ({
            id: r.id || r._id,
            patientId: r.patientUserId || "patient",
            doctorId: r.doctorId?._id || r.doctorId,
            organizationId: r.organizationId?._id || r.organizationId || organizationId,
            appointmentId: r.appointmentId,
            doctorRating: Number(r.rating || r.doctorRating) || 5,
            organizationRating: Number(r.rating || r.organizationRating) || 5,
            comment: r.comment,
            status: "VERIFIED" as ReviewStatus,
            createdAt: r.createdAt || new Date().toISOString(),
            displayName: r.author || r.patientName || "Verified Patient",
            specialization: r.doctorId?.specialization || "Medicine",
            appointmentType: "Physical",
            organizationName: r.organizationId?.name || "Clinic"
          }))
        }
      } catch (e) {}
    }

    const combined: Review[] = [...serverRevs]
    for (const lr of localRevs) {
      if (!combined.some(cr => cr.id === lr.id)) {
        combined.unshift(lr)
      }
    }

    return combined
  }

  async getPatientReviews(patientId: string): Promise<Review[]> {
    const localRevs: Review[] = this.getPersistedReviews()
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/reviews?patientUserId=${patientId}`)
      if (res && res.data && res.data.length > 0) {
        const serverRevs: Review[] = res.data.map(r => ({
          id: r.id || r._id,
          patientId: r.patientUserId || patientId,
          doctorId: r.doctorId?._id || r.doctorId,
          organizationId: r.organizationId?._id || r.organizationId,
          appointmentId: r.appointmentId,
          doctorRating: Number(r.rating) || 5,
          organizationRating: Number(r.rating) || 5,
          comment: r.comment,
          status: "VERIFIED" as ReviewStatus,
          createdAt: r.createdAt || new Date().toISOString(),
          displayName: r.author || r.patientName || "Verified Patient",
          specialization: r.doctorId?.specialization || "Medicine",
          appointmentType: "Physical",
          organizationName: r.organizationId?.name || "Healthcare Clinic"
        }))

        const combined: Review[] = [...serverRevs]
        for (const lr of localRevs) {
          if (!combined.some(cr => cr.id === lr.id)) {
            combined.unshift(lr)
          }
        }
        return combined
      }
    } catch {}

    return localRevs
  }

  async getReview(reviewId: string): Promise<Review | undefined> {
    return this.getPersistedReviews().find(r => r.id === reviewId)
  }

  isReviewEligible(appointment: Appointment): boolean {
    if (appointment.status !== "COMPLETED") return false
    if (appointment.attendance === "NOT_ATTENDED") return false
    if (this.hasReviewForAppointment(appointment.id)) return false
    return true
  }

  getReviewStatus(appointment: Appointment): ReviewStatus {
    if (this.hasReviewForAppointment(appointment.id)) {
      return "VERIFIED"
    }
    if (appointment.status === "COMPLETED" && appointment.attendance !== "NOT_ATTENDED") {
      return "AVAILABLE"
    }
    return "LOCKED"
  }

  hasReviewForAppointment(appointmentId: string): boolean {
    return this.getPersistedReviews().some(r => r.appointmentId === appointmentId)
  }

  async submitReview(reviewData: Omit<Review, "id" | "status" | "createdAt" | "verifiedAt">): Promise<Review> {
    let createdReview: Review | null = null

    try {
      const res = await apiClient.post<{ success: boolean; data: any }>("/reviews", {
        appointmentId: reviewData.appointmentId,
        doctorId: reviewData.doctorId,
        organizationId: reviewData.organizationId,
        rating: reviewData.doctorRating,
        comment: reviewData.comment
      })

      if (res && res.data) {
        const r = res.data
        createdReview = {
          id: r.id || r._id,
          patientId: reviewData.patientId,
          doctorId: reviewData.doctorId,
          organizationId: reviewData.organizationId,
          appointmentId: reviewData.appointmentId,
          doctorRating: reviewData.doctorRating,
          organizationRating: reviewData.organizationRating,
          comment: reviewData.comment,
          status: "VERIFIED",
          createdAt: r.createdAt || new Date().toISOString(),
          displayName: reviewData.displayName || "Verified Patient",
          specialization: reviewData.specialization || "General Medicine",
          appointmentType: reviewData.appointmentType || "Physical",
          organizationName: reviewData.organizationName || "Healthcare Center"
        }
      }
    } catch (err: any) {
      console.warn("⚠️ API review submission fallback to local store:", err?.message)
    }

    if (!createdReview) {
      createdReview = {
        ...reviewData,
        id: `rev_${Date.now()}`,
        status: "VERIFIED",
        createdAt: new Date().toISOString(),
        displayName: reviewData.displayName || "Verified Patient",
        specialization: reviewData.specialization || "General Medicine",
        appointmentType: reviewData.appointmentType || "Physical",
        organizationName: reviewData.organizationName || "Healthcare Center"
      }
    }

    this.savePersistedReview(createdReview)
    return createdReview
  }

  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0.0
    const sum = reviews.reduce((acc, rev) => {
      const r = Number(rev.organizationRating) || Number(rev.doctorRating) || 0
      return acc + r
    }, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  calculateRatingDistribution(reviews: Review[]) {
    const dist = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
    reviews.forEach(r => {
      const rating = Math.round(Number(r.organizationRating) || Number(r.doctorRating) || 0)
      if (rating >= 1 && rating <= 5) {
        dist[rating.toString() as keyof typeof dist]++
      }
    })
    return dist
  }

  getFeedbackSummary(reviews: Review[]): ReviewSummary {
    const verifiedReviews = reviews.filter(r => r.status === "VERIFIED" || !r.status)
    return {
      averageRating: this.calculateAverageRating(verifiedReviews),
      totalReviews: verifiedReviews.length,
      verifiedReviews: verifiedReviews.length,
      distribution: this.calculateRatingDistribution(verifiedReviews)
    }
  }
}

export const reviewService = new ReviewService()
