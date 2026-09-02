import React from "react"
import type { Appointment } from "../../lib/booking/appointment-types"
import { checkMeetingTimeStatus } from "../../lib/booking/meeting-time-utils"
import { Clock, Building2, Video, ChevronRight, Stethoscope } from "lucide-react"

interface NextAppointmentWidgetProps {
  appointment: Appointment | null
  onClick: (id: string) => void
}

export function NextAppointmentWidget({ appointment, onClick }: NextAppointmentWidgetProps) {
  if (!appointment) return null

  const timeCheck = checkMeetingTimeStatus(appointment.date, appointment.timeStr)
  const isOnline = appointment.consultationType === "Online"

  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Next Appointment</h3>
      
      <button 
        onClick={() => onClick(appointment.id)}
        className="w-full text-left bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 sm:p-6 rounded-2xl shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 relative overflow-hidden group"
      >
        {/* Decoration */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/20">
          {timeCheck.isReady ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              🟢 Consultation Ready • {appointment.timeStr}
            </>
          ) : timeCheck.isToday ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Starts Today at {appointment.timeStr}
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
              Upcoming: {new Date(appointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {appointment.timeStr}
            </>
          )}
        </div>

        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium mb-1">
              {isOnline ? <Video className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              {appointment.consultationType} Consultation
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold">{appointment.doctor.name}</h2>
            <p className="text-primary-foreground/80 mt-1">{appointment.organization.name}</p>
          </div>
          
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
            <Clock className="w-4 h-4" />
            {timeCheck.isToday ? "Today" : new Date(appointment.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            <span className="opacity-50 mx-1">•</span>
            {appointment.timeStr}
          </div>

          <div className="flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
            {isOnline ? (timeCheck.isReady ? "Join Video Call" : "View Consultation") : "View Details"}
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    </div>
  )
}
