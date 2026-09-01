import React, { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { reviewService } from "./review-service"
import type { Review, ReviewSummary } from "./review-types"
import { useAuth } from "../auth/AuthContext"

interface ReviewContextType {
  doctorReviews: Review[]
  patientReviews: Review[]
  summary: ReviewSummary | null
  isLoading: boolean
  refreshReviews: () => Promise<void>
  submitReview: (data: Omit<Review, "id" | "verified" | "createdAt">) => Promise<void>
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [doctorReviews, setDoctorReviews] = useState<Review[]>([])
  const [patientReviews, setPatientReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshReviews = async () => {
    setIsLoading(true)
    if (user?.role === "DOCTOR") {
      const revs = await reviewService.getDoctorReviews(user.id)
      setDoctorReviews(revs)
      setSummary(reviewService.getFeedbackSummary(revs))
    } else if (user?.role === "PATIENT") {
      const revs = await reviewService.getPatientReviews(user.id)
      setPatientReviews(revs)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      refreshReviews()
    }
  }, [user])

  const submitReview = async (data: Omit<Review, "id" | "verified" | "createdAt">) => {
    const newRev = await reviewService.submitReview(data)
    await refreshReviews() // Optimistic or full refresh
    
    // Simulate verification delay
    setTimeout(async () => {
      await reviewService.verifyReviewMock(newRev.id)
      await refreshReviews()
    }, 2000)
  }

  return (
    <ReviewContext.Provider value={{
      doctorReviews,
      patientReviews,
      summary,
      isLoading,
      refreshReviews,
      submitReview
    }}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewContext)
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider")
  }
  return context
}
