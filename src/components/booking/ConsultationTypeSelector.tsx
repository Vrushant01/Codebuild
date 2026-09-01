import React from "react"
import { Building2, Video, CheckCircle2 } from "lucide-react"
import { cn } from "../../lib/utils"
import type { ConsultationType } from "../../lib/booking/appointment-types"

interface ConsultationTypeSelectorProps {
  selected: ConsultationType
  onChange: (type: ConsultationType) => void
  supportsOnline: boolean
}

export function ConsultationTypeSelector({ selected, onChange, supportsOnline }: ConsultationTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      
      {/* Physical Card */}
      <button
        onClick={() => onChange("Physical")}
        className={cn(
          "relative flex flex-col items-start p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          selected === "Physical" 
            ? "border-primary bg-primary/5 shadow-sm" 
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <div className={cn(
          "p-2 rounded-xl mb-3",
          selected === "Physical" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Building2 className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-foreground">In-person</h4>
        <p className="text-xs text-muted-foreground mt-1">Visit the clinic in person</p>
        
        {selected === "Physical" && (
          <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
        )}
      </button>

      {/* Online Card */}
      <button
        onClick={() => onChange("Online")}
        disabled={!supportsOnline}
        className={cn(
          "relative flex flex-col items-start p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          !supportsOnline 
            ? "opacity-60 bg-muted border-transparent cursor-not-allowed"
            : selected === "Online"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <div className={cn(
          "p-2 rounded-xl mb-3",
          !supportsOnline 
            ? "bg-muted-foreground/20 text-muted-foreground"
            : selected === "Online" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Video className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-foreground">Video consultation</h4>
        <p className="text-xs text-muted-foreground mt-1">Online from anywhere</p>
        
        {!supportsOnline && (
          <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted-foreground/10 px-2 py-0.5 rounded-sm">
            N/A
          </span>
        )}

        {selected === "Online" && supportsOnline && (
          <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
        )}
      </button>

    </div>
  )
}
