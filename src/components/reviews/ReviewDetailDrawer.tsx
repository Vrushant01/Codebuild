import React from "react"
import { X, Calendar, User, Building2, Stethoscope, Clock, CheckCircle2 } from "lucide-react"
import type { Review } from "../../lib/reviews/review-types"
import { StarRating } from "./StarRating"
import { VerifiedReviewBadge } from "./VerifiedReviewBadge"

interface ReviewDetailDrawerProps {
  review: Review
  isOpen: boolean
  onClose: () => void
}

export function ReviewDetailDrawer({ review, isOpen, onClose }: ReviewDetailDrawerProps) {
  if (!isOpen) return null

  const submittedDate = new Date(review.createdAt).toLocaleDateString("en-US", { 
    month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric"
  })

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-card border-l shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold">Feedback Details</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Patient info & Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {review.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">{review.displayName}</p>
                <div className="flex items-center gap-2 mt-1">
                  {review.status === "VERIFIED" ? (
                    <VerifiedReviewBadge />
                  ) : review.status === "SUBMITTED" ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      Verification pending
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-muted/30 rounded-2xl p-5 border border-muted-foreground/10 space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Ratings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <Stethoscope className="w-4 h-4 text-primary" /> Doctor Experience
                </div>
                <StarRating rating={review.doctorRating} disabled />
              </div>
              <div className="border-t border-dashed" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <Building2 className="w-4 h-4 text-primary" /> Clinic Experience
                </div>
                <StarRating rating={review.organizationRating} disabled />
              </div>
            </div>
          </div>

          {/* Written Feedback */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Written Feedback</h3>
            {review.comment ? (
              <div className="bg-background border rounded-2xl p-5 text-base leading-relaxed">
                "{review.comment}"
              </div>
            ) : (
              <p className="text-muted-foreground italic text-sm">No written feedback provided.</p>
            )}
          </div>

          {/* Appointment Context */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Appointment Context</h3>
            <div className="bg-background border rounded-2xl p-5 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{review.appointmentType} Consultation</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Specialization</p>
                  <p className="font-medium">{review.specialization}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Organization</p>
                  <p className="font-medium">{review.organizationName || "CityCare Clinic"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Timeline</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Submitted: {submittedDate}
              </div>
              {review.status === "VERIFIED" && review.verifiedAt && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified: {new Date(review.verifiedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  )
}

