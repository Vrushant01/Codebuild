import React from "react"
import type { Appointment } from "../../lib/booking/appointment-types"
import { CheckCircle2, Clock, MapPin, Building2, Video, Stethoscope, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"

interface BookingSuccessStateProps {
  appointment: Appointment
}

export function BookingSuccessState({ appointment }: BookingSuccessStateProps) {
  const { doctor, organization, consultationType, date, timeStr } = appointment
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto py-12 px-4 animate-in zoom-in-95 duration-500">
      
      {/* Icon & Hero */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      
      <h1 className="text-2xl font-heading font-bold text-center mb-2">Request sent successfully</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Your appointment request is waiting for approval from the clinic. We'll notify you when the request is accepted.
      </p>

      {/* Appointment Status Card */}
      <div className="w-full bg-card border shadow-sm rounded-2xl overflow-hidden mb-8">
        
        {/* Status Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 px-5 py-3 flex items-center justify-between">
          <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">Status</span>
          <span className="bg-amber-200/50 dark:bg-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            Pending
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4 text-sm">
          <div className="flex gap-3">
            <Stethoscope className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-muted-foreground text-xs">{doctor.specialization}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{formatDate(date)}</p>
              <p className="text-muted-foreground text-xs">{timeStr}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{organization.name}</p>
              <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                {consultationType === "Physical" ? (
                  <><Building2 className="w-3 h-3" /> Clinic Visit</>
                ) : (
                  <><Video className="w-3 h-3" /> Online Consultation</>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Timeline (Static mock for Prompts 8) */}
      <div className="w-full pl-2 mb-10">
        <div className="relative border-l-2 border-primary/20 pl-6 pb-6">
          <div className="absolute w-4 h-4 rounded-full bg-primary -left-[9px] top-0 ring-4 ring-background" />
          <p className="font-semibold text-sm -mt-1">Request submitted</p>
          <p className="text-xs text-muted-foreground mt-1">Today</p>
        </div>
        <div className="relative border-l-2 border-transparent pl-6">
          <div className="absolute w-4 h-4 rounded-full bg-muted border-2 border-muted-foreground/30 -left-[9px] top-0 ring-4 ring-background" />
          <p className="font-medium text-sm text-muted-foreground -mt-1">Pending review</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Doctor / Receptionist</p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        <Button className="w-full" asChild>
          <Link to="/app/patient/appointments">View My Appointments</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/app/patient/map">Back to Healthcare Map</Link>
        </Button>
      </div>

    </div>
  )
}
