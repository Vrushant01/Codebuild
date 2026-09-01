import React from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, MapPin, Clock, AlertTriangle, Search, Activity, Stethoscope } from "lucide-react"
import type { SymptomData } from "../../lib/chat/chat-types"
import { Button } from "../ui/button"
import { useLocationStore } from "../../lib/location/LocationContext"
import { cn } from "../../lib/utils"

interface SymptomSummaryPanelProps {
  symptoms: SymptomData
  isReady: boolean
  className?: string
}

export function SymptomSummaryPanel({ symptoms, isReady, className }: SymptomSummaryPanelProps) {
  const navigate = useNavigate()
  const { searchLocation } = useLocationStore()

  const hasData = symptoms.symptoms.length > 0 || symptoms.location || symptoms.duration || symptoms.severity

  if (!hasData && !isReady) {
    return (
      <div className={cn("bg-muted/30 border-l p-6 flex flex-col items-center justify-center text-center text-muted-foreground", className)}>
        <ClipboardList className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-medium text-sm">Summary will appear here</p>
        <p className="text-xs mt-1 max-w-[200px]">As you chat, Medireach will organize your symptoms.</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-background border-l flex flex-col h-full overflow-y-auto", className)}>
      <div className="p-5 border-b sticky top-0 bg-background/95 backdrop-blur z-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Stethoscope className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Symptom Summary</h3>
          <p className="text-xs text-muted-foreground">
            {isReady ? "Ready for healthcare discovery" : "Collecting information..."}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1">
        
        {/* Symptoms List */}
        {symptoms.symptoms.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Symptoms
            </h4>
            <div className="flex flex-wrap gap-2">
              {symptoms.symptoms.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md font-medium capitalize">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location (Body part) */}
        {symptoms.location && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              Location
            </h4>
            <p className="text-sm font-medium capitalize">{symptoms.location}</p>
          </div>
        )}

        {/* Duration */}
        {symptoms.duration && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Duration
            </h4>
            <p className="text-sm font-medium capitalize">{symptoms.duration}</p>
          </div>
        )}

        {/* Severity */}
        {symptoms.severity && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Severity
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{symptoms.severity}</span>
              <span className="text-xs text-muted-foreground">/ 10</span>
            </div>
          </div>
        )}

        {/* Associated Symptoms */}
        {symptoms.associatedSymptoms.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Associated
            </h4>
            <div className="flex flex-wrap gap-2">
              {symptoms.associatedSymptoms.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Discovery Transition CTA */}
      {isReady && (
        <div className="p-5 border-t bg-primary/5 mt-auto animate-in slide-in-from-bottom-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Ready to explore care?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Based on what you've shared, you can now explore healthcare options.
              </p>
            </div>
            
            {searchLocation ? (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background border px-3 py-2 rounded-md">
                <MapPin className="w-3 h-3 text-primary" />
                Near {searchLocation.city}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
                <MapPin className="w-3 h-3" />
                No search location selected
              </div>
            )}

            <Button 
              className="w-full shadow-sm"
              onClick={() => navigate("/app/patient/map")}
            >
              <Search className="w-4 h-4 mr-2" />
              Find healthcare
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
