import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Appointment } from "../../lib/booking/appointment-types"
import { AppointmentTimeline } from "./AppointmentTimeline"
import { CancelAppointmentModal } from "./CancelAppointmentModal"
import { EarlyMeetingAlertModal } from "../telemedicine/EarlyMeetingAlertModal"
import { appointmentService } from "../../lib/booking/appointment-service"
import { checkMeetingTimeStatus } from "../../lib/booking/meeting-time-utils"
import { 
  X, ChevronLeft, MapPin, Building2, Video, 
  Stethoscope, Calendar, Clock, User, Navigation 
} from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface AppointmentDetailPanelProps {
  appointment: Appointment
  onClose: () => void
  onStatusChange: () => void
}

export function AppointmentDetailPanel({ appointment, onClose, onStatusChange }: AppointmentDetailPanelProps) {
  const navigate = useNavigate()
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isEarlyModalOpen, setIsEarlyModalOpen] = useState(false)

  const timeCheck = checkMeetingTimeStatus(appointment.date, appointment.timeStr)

  const handleJoinClick = () => {
    if (timeCheck.isReady) {
      navigate(`/telemedicine/${appointment.id}`)
    } else {
      setIsEarlyModalOpen(true)
    }
  }

  // Status Badge Logic
  let statusColor = "bg-muted text-muted-foreground border-border"
  let statusLabel: string = appointment.status
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
    case "REJECTED":
      statusColor = "bg-destructive/10 text-destructive border-destructive/20"
      statusLabel = appointment.status === "REJECTED" ? "Rejected" : "Cancelled"
      break
  }

  const handleCancel = async () => {
    try {
      await appointmentService.cancelAppointment(appointment.id, "Patient requested cancellation")
      onStatusChange() // trigger refresh in parent
    } catch (err) {
      console.error(err)
      alert("Could not cancel appointment.")
    }
  }

  const handleAttendance = async (attended: boolean) => {
    try {
      await appointmentService.confirmAttendance(appointment.id, attended)
      onStatusChange()
    } catch (err) {
      console.error(err)
    }
  }

  const isToday = new Date(appointment.date).toDateString() === new Date().toDateString()
  
  // Handoff logic
  const showCancel = appointment.status === "PENDING" || appointment.status === "ACCEPTED" || appointment.status === "CONFIRMED"
  const showJoinConsultation = appointment.consultationType === "Online" && appointment.status === "CONFIRMED"
  const showAttendanceHandoff = appointment.status === "COMPLETED" && appointment.attendance === "UNKNOWN"
  const showFeedbackHandoff = appointment.status === "COMPLETED" && appointment.attendance === "ATTENDED"

  return (
    <div className="flex flex-col h-full bg-background relative overflow-y-auto overflow-x-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/90 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full -ml-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm">Appointment Details</span>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="p-5 lg:p-8 space-y-8 max-w-2xl mx-auto w-full">
        
        {/* Status & Hero */}
        <div>
          <div className={cn("inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-4", statusColor)}>
            {statusLabel}
          </div>
          
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground leading-tight">{appointment.doctor.name}</h2>
              <p className="text-muted-foreground">{appointment.doctor.specialization}</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-xl border flex gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Date & Time</p>
              <p className="font-semibold text-sm">{new Date(appointment.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}</p>
              <p className="text-sm">{appointment.timeStr}</p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-xl border flex gap-3">
            <User className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Patient</p>
              <p className="font-semibold text-sm">
                {appointment.appointmentFor === "Myself" ? "Myself" : appointment.familyMemberName}
              </p>
              {appointment.appointmentFor !== "Myself" && (
                <p className="text-xs text-muted-foreground">{appointment.relationship}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location / Online Info */}
        <div className="pt-6 border-t border-dashed">
          <h3 className="font-bold mb-4">Location</h3>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              {appointment.consultationType === "Physical" ? <Building2 className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{appointment.consultationType === "Physical" ? appointment.organization.name : "Online Consultation"}</p>
              
              {appointment.consultationType === "Physical" ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {appointment.organization.address}, {appointment.organization.city}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  You will receive a secure video link before the consultation begins.
                </p>
              )}

              {appointment.consultationType === "Physical" && (
                <Button variant="outline" size="sm" className="mt-4 gap-2">
                  <Navigation className="w-4 h-4" /> Get Directions
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-6 border-t border-dashed">
          <h3 className="font-bold mb-4">Timeline</h3>
          <AppointmentTimeline appointment={appointment} />
        </div>

        {/* Handoffs & Actions */}
        <div className="pt-6 border-t space-y-3">
          
          {showJoinConsultation && (
            <Button 
              className={cn(
                "w-full gap-2 py-6 text-base font-bold shadow-lg transition-all",
                timeCheck.isReady 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
              )}
              onClick={handleJoinClick}
            >
              <Video className="w-5 h-5" />
              {timeCheck.isReady ? "🟢 Join Video Consultation (Active Now)" : "Join Video Consultation"}
            </Button>
          )}

          {showAttendanceHandoff && (
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl space-y-4 text-center">
              <p className="font-semibold">Did you attend this appointment?</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => handleAttendance(true)}>Yes, I attended</Button>
                <Button variant="outline" onClick={() => handleAttendance(false)}>No</Button>
              </div>
            </div>
          )}

          {showFeedbackHandoff && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 p-5 rounded-xl space-y-3 text-center">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Feedback available</p>
              <p className="text-sm text-blue-800/80 dark:text-blue-300">Help others by sharing your experience.</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Leave Feedback</Button>
            </div>
          )}

          {showCancel && (
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel Appointment
            </Button>
          )}

        </div>
      </div>

      <EarlyMeetingAlertModal 
        isOpen={isEarlyModalOpen}
        onClose={() => setIsEarlyModalOpen(false)}
        onProceedAnyway={() => {
          setIsEarlyModalOpen(false)
          navigate(`/telemedicine/${appointment.id}`)
        }}
        doctorName={appointment.doctor.name}
        scheduledDate={appointment.date}
        scheduledTime={appointment.timeStr}
        message={timeCheck.message}
        minutesRemaining={timeCheck.minutesUntilStart}
      />

      <CancelAppointmentModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
      />
    </div>
  )
}
