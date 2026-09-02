import React from "react"
import { Star } from "lucide-react"

interface AverageRatingCardProps {
  averageRating: number
  totalReviews: number
  verifiedReviews: number
}

export function AverageRatingCard({ averageRating, totalReviews, verifiedReviews }: AverageRatingCardProps) {
  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Average Rating</h3>
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-5xl font-heading font-black">{averageRating.toFixed(1)}</span>
        <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
      </div>
      
      <p className="text-muted-foreground font-medium">
        Based on <strong className="text-foreground">{verifiedReviews}</strong> verified reviews
      </p>
      
      {totalReviews > verifiedReviews && (
        <p className="text-xs text-muted-foreground/70 mt-1">
          {totalReviews - verifiedReviews} reviews awaiting verification
        </p>
      )}
    </div>
  )
}
