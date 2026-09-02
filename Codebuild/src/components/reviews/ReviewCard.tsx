import React, { useState } from "react"
import type { Review } from "../../lib/reviews/review-types"
import { StarRating } from "./StarRating"
import { VerifiedReviewBadge } from "./VerifiedReviewBadge"
import { Video, Building2, Stethoscope, Star } from "lucide-react"
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
        className="bg-card border rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group w-full"
      >
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-base shadow-inner">
              {review.displayName?.charAt(0).toUpperCase() || "P"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-foreground text-sm">{review.displayName}</p>
                {review.status === "VERIFIED" ? (
                  <VerifiedReviewBadge />
                ) : review.status === "SUBMITTED" ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    Pending
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
            </div>
          </div>

          {/* Appointment Type Badge */}
          {review.appointmentType && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-xl self-start sm:self-center shrink-0">
              {review.appointmentType.toLowerCase().includes("online") || review.appointmentType.toLowerCase().includes("video")
                ? <Video className="w-3.5 h-3.5 text-primary" /> 
                : <Building2 className="w-3.5 h-3.5 text-primary" />
              }
              {review.appointmentType}
            </div>
          )}
        </div>

        {/* Structured Ratings Grid (Doctor & Clinic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">Doctor</span>
            <div className="flex items-center gap-1">
              <StarRating rating={review.doctorRating} disabled size="sm" />
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 sm:border-l sm:border-border/60 sm:pl-3.5">
            <span className="text-xs font-bold text-muted-foreground">Clinic</span>
            <div className="flex items-center gap-1">
              <StarRating rating={review.organizationRating} disabled size="sm" />
            </div>
          </div>
        </div>
  
        {/* Review Comment */}
        {review.comment && (
          <div className="bg-background/80 p-4 rounded-2xl border border-border/60 text-sm leading-relaxed text-foreground/90 group-hover:border-primary/30 transition-colors">
            "{review.comment}"
          </div>
        )}

        {/* Optional Doctor Context */}
        {showDoctorContext && (
          <div className="pt-3 border-t border-dashed flex items-center justify-between text-xs text-muted-foreground">
             <div className="flex items-center gap-1.5 font-medium">
               <Stethoscope className="w-3.5 h-3.5 text-primary" />
               <span>Dr. Aarav Patel</span>
             </div>
             <span className="text-primary font-bold group-hover:underline">View details</span>
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
