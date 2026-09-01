import React from "react"
import type { PatientType } from "../../lib/booking/appointment-types"
import { User, Users } from "lucide-react"
import { cn } from "../../lib/utils"
import { Input } from "../ui/input"

interface AppointmentForSelectorProps {
  patientType: PatientType
  onTypeChange: (type: PatientType) => void
  familyMemberName: string
  onNameChange: (name: string) => void
  relationship: string
  onRelationshipChange: (rel: string) => void
}

export function AppointmentForSelector({ 
  patientType, onTypeChange, 
  familyMemberName, onNameChange, 
  relationship, onRelationshipChange 
}: AppointmentForSelectorProps) {
  
  return (
    <div className="space-y-4">
      <div className="flex bg-muted p-1 rounded-xl">
        <button
          onClick={() => onTypeChange("Myself")}
          className={cn(
            "flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all",
            patientType === "Myself" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="w-4 h-4" />
          Myself
        </button>
        <button
          onClick={() => onTypeChange("Family member")}
          className={cn(
            "flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all",
            patientType === "Family member" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          Family Member
        </button>
      </div>

      {patientType === "Family member" && (
        <div className="grid sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground ml-1">Patient Name</label>
            <Input 
              placeholder="e.g. Meena Patel" 
              value={familyMemberName} 
              onChange={(e) => onNameChange(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground ml-1">Relationship</label>
            <Input 
              placeholder="e.g. Mother, Son" 
              value={relationship} 
              onChange={(e) => onRelationshipChange(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      )}
    </div>
  )
}
