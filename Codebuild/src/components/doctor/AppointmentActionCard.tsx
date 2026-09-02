import React from "react"
import { useNavigate } from "react-router-dom"
import type { DoctorAppointment } from "../../lib/doctor/doctor-types"
import { Clock, MapPin, Video, Check, X, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"

interface AppointmentActionCardProps {
  appointment: DoctorAppointment
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}

export function AppointmentActionCard({ appointment, onAccept, onReject }: AppointmentActionCardProps) {
  const navigate = useNavigate()
  
  const isPending = appointment.status === "PENDING"

  return (
    <div className="bg-card border rounded-3xl p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
        
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
            {appointment.patientProfile.avatarInitials}
          </div>
          
          <div>
            <h4 className="font-bold text-lg leading-tight">{appointment.patientProfile.name}</h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {appointment.timeStr}
              </span>
              <span className="flex items-center gap-1 font-medium">
                {appointment.consultationType === "Online" ? (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                    <Video className="w-3.5 h-3.5" /> Online
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3.5 h-3.5" /> Clinic
                  </span>
                )}
              </span>
            </div>
            
            {appointment.currentCase && (
              <div className="mt-3 bg-muted/50 p-2.5 rounded-xl text-sm border border-dashed">
                <span className="font-semibold block mb-0.5 text-xs uppercase tracking-wider text-muted-foreground">Current Case</span>
                {appointment.currentCase.title}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {isPending && onAccept && onReject ? (
            <>
              <Button variant="outline" size="sm" onClick={() => onReject(appointment.id)} className="text-destructive border-destructive hover:bg-destructive/10">
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button size="sm" onClick={() => onAccept(appointment.id)}>
                <Check className="w-4 h-4 mr-1" /> Accept
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground group" onClick={() => navigate(`/app/doctor/appointments/${appointment.id}`)}>
              View Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}
