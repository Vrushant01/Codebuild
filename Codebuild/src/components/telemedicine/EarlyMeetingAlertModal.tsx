import React from "react"
import { Clock, AlertCircle, Video, ArrowRight, X } from "lucide-react"
import { Button } from "../ui/button"

interface EarlyMeetingAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onProceedAnyway: () => void
  doctorName: string
  scheduledDate: string
  scheduledTime: string
  message: string
  minutesRemaining: number
  isDoctorView?: boolean
}

export function EarlyMeetingAlertModal({
  isOpen,
  onClose,
  onProceedAnyway,
  doctorName,
  scheduledDate,
  scheduledTime,
  message,
  minutesRemaining,
  isDoctorView = false
}: EarlyMeetingAlertModalProps) {
  if (!isOpen) return null

  const isToday = new Date(scheduledDate).toDateString() === new Date().toDateString()

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
            {isToday ? "Scheduled for Today" : "Upcoming Consultation"}
          </span>

          <h3 className="text-2xl font-heading font-black text-foreground pt-1">
            Meeting Not Started Yet
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {isDoctorView ? (
              <>Your consultation with patient is scheduled for <strong>{isToday ? "Today" : scheduledDate} at {scheduledTime}</strong>.</>
            ) : (
              <>Your consultation with <strong>{doctorName}</strong> is scheduled for <strong>{isToday ? "Today" : scheduledDate} at {scheduledTime}</strong>.</>
            )}
          </p>

          {isToday && minutesRemaining > 0 && (
            <div className="bg-muted/60 rounded-xl py-2 px-3 text-xs font-semibold text-foreground inline-flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Scheduled to start in ~{minutesRemaining} minute{minutesRemaining !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button 
            onClick={onProceedAnyway}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-2xl shadow-lg shadow-primary/20 gap-2 text-sm"
          >
            <Video className="w-4 h-4" />
            Start Consultation Now (Early Entry)
          </Button>

          <Button 
            variant="outline"
            onClick={onClose}
            className="w-full py-5 rounded-2xl font-semibold text-xs text-muted-foreground hover:text-foreground"
          >
            Wait for Scheduled Time ({scheduledTime})
          </Button>
        </div>

      </div>
    </div>
  )
}
