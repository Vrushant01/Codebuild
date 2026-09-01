import React, { useEffect, useState } from "react"
import type { Review, ReviewSummary } from "../../lib/reviews/review-types"
import { reviewService } from "../../lib/reviews/review-service"
import { ReviewCard } from "./ReviewCard"
import { Star } from "lucide-react"
import { Button } from "../ui/button"

interface DoctorReviewsProps {
  doctorId: string
}

export function DoctorReviews({ doctorId }: DoctorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const revs = await reviewService.getDoctorReviews(doctorId)
      setReviews(revs)
      setSummary(reviewService.getFeedbackSummary(revs))
      setLoading(false)
    }
    loadData()
  }, [doctorId])

  if (loading || !summary) {
    return <div className="animate-pulse h-32 bg-muted rounded-2xl" />
  }

  if (reviews.length === 0) {
    return null
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold font-heading">Patient Reviews</h3>
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-bold border border-amber-200/50">
          <Star className="w-4 h-4 fill-current" />
          {summary.averageRating.toFixed(1)}
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {summary.verifiedReviews} verified reviews
        </span>
      </div>

      <div className="grid gap-4">
        {displayedReviews.map(r => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>

      {reviews.length > 3 && !showAll && (
        <Button variant="outline" className="w-full" onClick={() => setShowAll(true)}>
          Show all {reviews.length} reviews
        </Button>
      )}
    </div>
  )
}
