import React, { useState, useEffect } from "react"
import { useReviews } from "../../lib/reviews/ReviewContext"
import { appointmentService } from "../../lib/booking/appointment-service"
import { reviewService } from "../../lib/reviews/review-service"
import type { Appointment } from "../../lib/booking/appointment-types"
import { ReviewCard } from "../../components/reviews/ReviewCard"
import { FeedbackForm } from "../../components/reviews/FeedbackForm"
import { useAuth } from "../../lib/auth/AuthContext"
import { CalendarX2, Building2, Video, ChevronDown, ChevronUp, CheckCircle2, Lock } from "lucide-react"

export default function PatientReviewCenter() {
  const { user } = useAuth()
  const { patientReviews, submitReview, isLoading } = useReviews()
  
  const [activeTab, setActiveTab] = useState<"TO_REVIEW" | "SUBMITTED" | "VERIFIED">("TO_REVIEW")
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [expandedAptId, setExpandedAptId] = useState<string | null>(null)
  
  // Local state for immediate feedback on submission
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, "SUBMITTED" | "VERIFIED">>({})

  useEffect(() => {
    const loadData = async () => {
      const allApts = await appointmentService.getAppointments()
      // Sort appointments descending by date for display
      setAppointments(allApts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    }
    loadData()
  }, [patientReviews])

  const handleReviewSubmit = async (appointment: Appointment, doctorRating: number, orgRating: number, comment: string) => {
    await submitReview({
      patientId: user!.id,
      doctorId: appointment.doctor.id,
      organizationId: appointment.organization.id,
      appointmentId: appointment.id,
      doctorRating,
      organizationRating: orgRating,
      comment,
      displayName: "Krish B.", // Simulating privacy safe name based on user
      specialization: appointment.doctor.specialization,
      appointmentType: appointment.consultationType,
      organizationName: appointment.organization.name
    })
    
    // Set local mock status for immediate feedback
    setSubmissionStatus(prev => ({ ...prev, [appointment.id]: "SUBMITTED" }))
    setExpandedAptId(null)
    
    // Simulate verification update
    setTimeout(() => {
      setSubmissionStatus(prev => ({ ...prev, [appointment.id]: "VERIFIED" }))
    }, 2000)
  }

  // Filter lists
  const availableApts = appointments.filter(a => reviewService.getReviewStatus(a) === "AVAILABLE" && !submissionStatus[a.id])
  const lockedApts = appointments.filter(a => reviewService.getReviewStatus(a) === "LOCKED" && a.status !== "CANCELLED" && a.status !== "REJECTED" && !submissionStatus[a.id])
  const submittedReviews = patientReviews.filter(r => r.status === "SUBMITTED" || submissionStatus[r.appointmentId] === "SUBMITTED")
  const verifiedReviews = patientReviews.filter(r => r.status === "VERIFIED" || submissionStatus[r.appointmentId] === "VERIFIED")

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="h-32 bg-muted rounded-3xl" />
        <div className="h-32 bg-muted rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-heading font-bold">My Reviews</h1>
        <p className="text-muted-foreground mt-1">Share feedback from your verified appointments.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab("TO_REVIEW")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "TO_REVIEW" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          To Review ({availableApts.length})
        </button>
        <button 
          onClick={() => setActiveTab("SUBMITTED")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "SUBMITTED" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Submitted ({submittedReviews.length})
        </button>
        <button 
          onClick={() => setActiveTab("VERIFIED")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "VERIFIED" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Verified ({verifiedReviews.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        
        {activeTab === "TO_REVIEW" && (
          <>
            {availableApts.length === 0 && lockedApts.length === 0 ? (
              <div className="bg-card border rounded-3xl p-12 text-center border-dashed">
                <CalendarX2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="font-semibold text-lg text-foreground">You're all caught up!</p>
                <p className="text-muted-foreground mt-2">Feedback unlocks after your appointment is completed and attendance is confirmed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Available to review */}
                {availableApts.map(apt => {
                  const isExpanded = expandedAptId === apt.id

                  return (
                    <div key={apt.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm transition-all">
                      <div 
                        className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-muted/30"
                        onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                      >
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold text-lg">{apt.doctor.name}</h3>
                          <p className="text-sm text-primary font-medium">{apt.doctor.specialization} &bull; {apt.organization.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 font-medium">
                            {apt.consultationType === "Physical" ? <Building2 className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                            {apt.date} at {apt.timeStr}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          {isExpanded ? "Close" : "Leave feedback"}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-5 sm:p-6 border-t bg-muted/10">
                          <div className="max-w-2xl">
                            <FeedbackForm 
                              onSubmit={(dRating, oRating, comment) => handleReviewSubmit(apt, dRating, oRating, comment)} 
                              onCancel={() => setExpandedAptId(null)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Locked Appointments (Upcoming or completed but not confirmed) */}
                {lockedApts.length > 0 && (
                  <>
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mt-8 mb-4">Locked Feedback</h3>
                    {lockedApts.map(apt => (
                      <div key={apt.id} className="bg-card border rounded-2xl p-5 sm:p-6 opacity-60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold">{apt.doctor.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-medium">
                            {apt.date} &bull; {apt.status === "COMPLETED" ? "Pending attendance confirmation" : "Upcoming appointment"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                          <Lock className="w-4 h-4" /> Locked
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "SUBMITTED" && (
          <>
            {submittedReviews.length === 0 ? (
              <div className="bg-card border rounded-3xl p-12 text-center border-dashed">
                <p className="font-semibold text-lg text-foreground">No pending reviews.</p>
                <p className="text-muted-foreground mt-2">Reviews that are pending backend verification will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedReviews.map(review => (
                  <ReviewCard key={review.id} review={review} showDoctorContext />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === "VERIFIED" && (
          <>
            {verifiedReviews.length === 0 ? (
              <div className="bg-card border rounded-3xl p-12 text-center border-dashed">
                <p className="font-semibold text-lg text-foreground">No verified reviews.</p>
                <p className="text-muted-foreground mt-2">Reviews that have been successfully verified will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifiedReviews.map(review => (
                  <ReviewCard key={review.id} review={review} showDoctorContext />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
