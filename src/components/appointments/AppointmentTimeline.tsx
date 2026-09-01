import React from "react"
import type { Appointment } from "../../lib/booking/appointment-types"
import { Check, Clock, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface AppointmentTimelineProps {
  appointment: Appointment
}

export function AppointmentTimeline({ appointment }: AppointmentTimelineProps) {
  const { status } = appointment

  // Determine active steps based on status
  // Source flow: Request submitted -> Approved -> Confirmed -> Consultation -> Completed
  
  const steps = [
    { id: "requested", label: "Request submitted", completed: true },
    { 
      id: "approved", 
      label: "Clinic review", 
      completed: status !== "PENDING" && status !== "REJECTED",
      current: status === "PENDING",
      error: status === "REJECTED" ? "Rejected" : undefined
    },
    { 
      id: "confirmed", 
      label: "Confirmed", 
      completed: status === "CONFIRMED" || status === "COMPLETED",
      current: status === "ACCEPTED",
      error: status === "CANCELLED" ? "Cancelled" : undefined
    },
    { 
      id: "consultation", 
      label: "Consultation", 
      completed: status === "COMPLETED",
      current: status === "CONFIRMED" 
    },
  ]

  return (
    <div className="py-2">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const hasError = !!step.error

        return (
          <div key={step.id} className="relative flex gap-4">
            
            {/* Timeline Line & Node */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2",
                hasError 
                  ? "bg-destructive/10 border-destructive text-destructive"
                  : step.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : step.current
                      ? "bg-background border-primary text-primary"
                      : "bg-background border-muted text-muted-foreground/30"
              )}>
                {hasError ? <X className="w-3.5 h-3.5" /> : step.completed ? <Check className="w-3.5 h-3.5" /> : <div className={cn("w-1.5 h-1.5 rounded-full", step.current ? "bg-primary" : "bg-muted")} />}
              </div>
              
              {!isLast && (
                <div className={cn(
                  "w-0.5 h-10 transition-colors",
                  step.completed && !hasError ? "bg-emerald-500" : "bg-border"
                )} />
              )}
            </div>

            {/* Content */}
            <div className="pt-0.5 pb-8">
              <p className={cn(
                "text-sm font-semibold",
                hasError ? "text-destructive" : step.completed || step.current ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.error || step.label}
              </p>
              
              {/* Optional dynamic sub-text for mock UI */}
              {step.current && step.id === "approved" && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Waiting for response
                </p>
              )}
              {step.completed && step.id === "requested" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(appointment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              )}
              {hasError && appointment.cancellationReason && (
                <p className="text-xs text-destructive/80 mt-1">
                  {appointment.cancellationReason}
                </p>
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}
