import React from "react"
import { Lock, ShieldAlert, Activity, Pill, History } from "lucide-react"
import type { PatientProfile, MedicalCase, Allergy, HistoryTimelineItem } from "../../lib/profile/profile-types"
import type { Medicine } from "../../lib/schedule/schedule-types"
import { PatientAllergyPanel } from "../identity/PatientAllergyPanel"

interface PatientContextPanelProps {
  isAuthorized: boolean
  profile: PatientProfile
  currentCase?: MedicalCase
  allergies?: Allergy[]
  timeline?: HistoryTimelineItem[]
  medicines?: Medicine[]
}

export function PatientContextPanel({ isAuthorized, profile, currentCase, allergies = [], timeline = [], medicines = [] }: PatientContextPanelProps) {
  
  if (!isAuthorized) {
    return (
      <div className="bg-card border rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center">
        <Lock className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-bold text-lg mb-2">Protected Medical Information</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Relevant medical information is available only when access is authorized for an active consultation.
        </p>
      </div>
    )
  }

  const currentMedicines = medicines.filter(m => m.status === "active")
  const previousMedicines = medicines.filter(m => m.status !== "active")

  return (
    <div className="space-y-6">
      
      {/* Allergies Warning - Highest Priority if present */}
      <PatientAllergyPanel patientId={profile.patientId} isAuthorized={isAuthorized} allergies={allergies} />

      {/* Current Case */}
      {currentCase && (
        <div className="bg-card border rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Current Case
          </h3>
          <div className="bg-muted/30 rounded-2xl p-4 border border-dashed">
            <h4 className="font-semibold text-lg">{currentCase.title}</h4>
            {currentCase.symptoms.length > 0 && (
              <div className="mt-3">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2">Reported Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {currentCase.symptoms.map(sym => (
                    <span key={sym} className="bg-background border rounded-lg px-2.5 py-1 text-sm font-medium">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentCase.notes && (
              <p className="text-sm mt-4 text-muted-foreground">"{currentCase.notes}"</p>
            )}
          </div>
        </div>
      )}

      {/* Medication Schedule (Current) */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-blue-500" /> Current Medication
        </h3>
        {currentMedicines.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No active medication.</p>
        ) : (
          <div className="space-y-3">
            {currentMedicines.map(med => (
              <div key={med.id} className="bg-muted/50 rounded-2xl p-4 border">
                <h4 className="font-bold">{med.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {med.dosage} • {med.frequency} • {med.foodInstruction}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Medication */}
      {previousMedicines.length > 0 && (
        <div className="bg-card border rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-muted-foreground">
            <History className="w-5 h-5" /> Previous Medication
          </h3>
          <div className="space-y-3">
            {previousMedicines.map(med => (
              <div key={med.id} className="flex justify-between items-center py-2 border-b last:border-0 border-dashed">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{med.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{med.dosage} • {med.frequency}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-muted text-muted-foreground">
                  {med.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relevant History */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-muted-foreground">
          <History className="w-5 h-5" /> Medical History
        </h3>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No previous history available.</p>
        ) : (
          <div className="space-y-4">
            {timeline.slice(0, 5).map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                   <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.date).toLocaleDateString()} • {item.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
