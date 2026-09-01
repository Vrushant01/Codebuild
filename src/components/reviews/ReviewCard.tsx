import React, { useState } from "react"
import type { Review } from "../../lib/reviews/review-types"
import { StarRating } from "./StarRating"
import { VerifiedReviewBadge } from "./VerifiedReviewBadge"
import { Video, Building2, User, Stethoscope } from "lucide-react"
import { ReviewDetailDrawer } from "./ReviewDetailDrawer"

interface ReviewCardProps {
  review: Review
  showDoctorContext?: boolean
}

export function ReviewCard({ review, showDoctorContext = false }: ReviewCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const date = new Date(review.createdAt).toLocaleDateString("en-US", { 
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  })

  return (
    <>
      <article 
        onClick={() => setIsDrawerOpen(true)}
        className="bg-card border rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      >
        
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          
          <div className="flex flex-col gap-3">
            {/* Patient Info & Badges */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                {review.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{review.displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">{date}</p>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  {review.status === "VERIFIED" ? (
                    <VerifiedReviewBadge />
                  ) : review.status === "SUBMITTED" ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      Verification pending
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            
            {/* Ratings Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground w-16">Doctor</span>
                <StarRating rating={review.doctorRating} disabled size="sm" />
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground w-16">Clinic</span>
                <StarRating rating={review.organizationRating} disabled size="sm" />
              </div>
            </div>
          </div>
  
          {/* Optional context (e.g. appointment type) */}
          {review.appointmentType && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
              {review.appointmentType === "Online" || review.appointmentType === "Video consultation" 
                ? <Video className="w-3.5 h-3.5" /> 
                : <Building2 className="w-3.5 h-3.5" />
              }
              {review.appointmentType}
            </div>
          )}
        </div>
  
        {/* Review Text */}
        {review.comment && (
          <div className="bg-muted/30 p-4 rounded-xl border border-muted-foreground/10 text-sm leading-relaxed text-foreground/90 group-hover:bg-muted/50 transition-colors">
            "{review.comment}"
          </div>
        )}

        {/* Doctor Context if needed */}
        {showDoctorContext && (
          <div className="pt-4 border-t border-dashed flex items-center justify-between text-sm">
             <div className="flex items-center gap-2 text-muted-foreground">
               <Stethoscope className="w-4 h-4" />
               <span>Dr. Aarav Patel</span>
             </div>
             <span className="text-primary font-medium group-hover:underline">View details</span>
          </div>
        )}
  
      </article>

      <ReviewDetailDrawer
        review={review}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}
