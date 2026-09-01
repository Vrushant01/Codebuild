import React from "react"
import type { Doctor, Organization } from "../../lib/healthcare/types"
import type { ConsultationType, PatientType } from "../../lib/booking/appointment-types"
import { Building2, Calendar, Clock, Stethoscope, Video, MapPin, User, ChevronRight } from "lucide-react"

interface AppointmentSummaryProps {
  doctor: Doctor
  organization: Organization
  consultationType: ConsultationType
  date: string | null
  timeStr: string | null
  patientType: PatientType
  familyMemberName?: string
  relationship?: string
  onEditSection?: (section: string) => void
}

export function AppointmentSummary({ 
  doctor, organization, consultationType, date, timeStr, 
  patientType, familyMemberName, relationship, onEditSection 
}: AppointmentSummaryProps) {
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div className="bg-muted/30 border rounded-2xl overflow-hidden text-sm">
      <div className="px-5 py-4 bg-muted/50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Review Appointment</h3>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Doctor & Type */}
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{doctor.name}</p>
            <p className="text-muted-foreground">{doctor.specialization}</p>
            <div className="flex items-center gap-1.5 mt-2 text-primary font-medium bg-primary/5 w-fit px-2 py-1 rounded-md text-xs border border-primary/10">
              {consultationType === "Physical" ? <Building2 className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              {consultationType} Consultation
            </div>
          </div>
        </div>

        {/* Location / Org */}
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{organization.name}</p>
            {consultationType === "Physical" ? (
              <p className="text-muted-foreground mt-0.5">{organization.address}, {organization.city}</p>
            ) : (
              <p className="text-muted-foreground mt-0.5">Link will be shared upon confirmation</p>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex gap-4 items-start relative group">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1">
            {date && timeStr ? (
              <>
                <p className="font-semibold text-foreground">{formatDate(date)}</p>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {timeStr}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground italic mt-1.5">Date & time not selected</p>
            )}
          </div>
          {onEditSection && (
            <button 
              onClick={() => onEditSection('date')}
              className="opacity-0 group-hover:opacity-100 absolute right-0 top-1 text-xs text-primary font-medium transition-opacity"
            >
              Edit
            </button>
          )}
        </div>

        {/* Patient Info */}
        <div className="flex gap-4 items-start pt-4 border-t border-dashed">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Appointment for</p>
            {patientType === "Myself" ? (
              <p className="text-muted-foreground mt-0.5">Myself</p>
            ) : (
              <p className="text-muted-foreground mt-0.5">
                {familyMemberName || "Family Member"} 
                {relationship && <span className="opacity-70"> ({relationship})</span>}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
