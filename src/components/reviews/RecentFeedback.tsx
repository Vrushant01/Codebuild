import React from "react"
import type { Review } from "../../lib/reviews/review-types"
import { ReviewCard } from "./ReviewCard"

interface RecentFeedbackProps {
  reviews: Review[]
}

export function RecentFeedback({ reviews }: RecentFeedbackProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-card border rounded-3xl p-8 text-center border-dashed">
        <p className="text-muted-foreground">No patient feedback yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Completed appointments can generate verified reviews.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl">Recent Feedback</h3>
      </div>
      
      <div className="space-y-4">
        {reviews.slice(0, 5).map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
