import React from "react"
import type { Appointment } from "../../lib/booking/appointment-types"
import type { AppointmentStatus } from "../../lib/booking/appointment-types"
import { Calendar, Clock, MapPin, Building2, Video, ChevronRight, Stethoscope } from "lucide-react"
import { cn } from "../../lib/utils"

interface AppointmentCardProps {
  appointment: Appointment
  isSelected?: boolean
  onClick: (id: string) => void
}

export function AppointmentCard({ appointment, isSelected, onClick }: AppointmentCardProps) {
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'short' })
  }

  // Determine status color and label
  let statusColor = "bg-muted text-muted-foreground border-border"
  let statusLabel: string = appointment.status as AppointmentStatus | string
  let StatusIcon = null

  switch (appointment.status) {
    case "PENDING":
      statusColor = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900"
      statusLabel = "Waiting for approval"
      break
    case "CONFIRMED":
    case "ACCEPTED":
      statusColor = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"
      statusLabel = "Confirmed"
      break
    case "COMPLETED":
      statusColor = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900"
      statusLabel = "Completed"
      break
    case "CANCELLED":
      statusColor = "bg-destructive/10 text-destructive border-destructive/20"
      statusLabel = "Cancelled"
      break
    case "REJECTED":
      statusColor = "bg-destructive/10 text-destructive border-destructive/20"
      statusLabel = "Rejected"
      break
  }

  return (
    <button
      onClick={() => onClick(appointment.id)}
      className={cn(
        "w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex flex-col gap-4",
        isSelected 
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
      )}
    >
      
      {/* Header: Date, Time & Status */}
      <div className="flex justify-between items-start gap-2 w-full">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center bg-muted rounded-lg w-12 h-12 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">{new Date(appointment.date).toLocaleDateString("en-US", { month: "short" })}</span>
            <span className="text-lg font-heading font-bold leading-none">{new Date(appointment.date).getDate()}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {appointment.timeStr}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(appointment.date)}</p>
          </div>
        </div>

        <div className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", statusColor)}>
          {statusLabel}
        </div>
      </div>

      {/* Body: Doctor & Type */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{appointment.doctor.name}</p>
            <p className="text-xs text-muted-foreground truncate">{appointment.doctor.specialization}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>

      {/* Footer: Location / Online */}
      <div className="pt-3 border-t flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {appointment.consultationType === "Physical" ? (
          <>
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{appointment.organization.name}</span>
          </>
        ) : (
          <>
            <Video className="w-3.5 h-3.5 text-blue-500" />
            <span>Online Consultation</span>
          </>
        )}
      </div>

    </button>
  )
}
