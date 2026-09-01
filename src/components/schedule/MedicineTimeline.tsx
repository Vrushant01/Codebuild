import React from "react"
import type { Dose, Medicine } from "../../lib/schedule/schedule-types"
import { MedicineCard } from "./MedicineCard"
import { AlertCircle } from "lucide-react"

interface MedicineTimelineProps {
  doses: (Dose & { medicine: Medicine })[]
  onMarkTaken: (id: string) => Promise<void>
  onMedicineClick?: (medicine: Medicine) => void
}

export function MedicineTimeline({ doses, onMarkTaken, onMedicineClick }: MedicineTimelineProps) {
  if (doses.length === 0) {
    return (
      <div className="py-12 px-4 text-center border-2 border-dashed rounded-3xl bg-muted/20">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <AlertCircle className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-xl font-bold font-heading mb-2">No medicines scheduled</h3>
        <p className="text-muted-foreground">You don't have any medicines scheduled for this date.</p>
      </div>
    )
  }

  return (
    <div className="relative border-l-2 border-muted/50 ml-6 pl-8 lg:ml-8 lg:pl-10 space-y-8 py-4">
      {doses.map((dose) => (
        <div key={dose.id} className="relative">
          {/* Timeline Dot */}
          <div className="absolute -left-[37px] lg:-left-[45px] top-6 w-4 h-4 rounded-full border-4 border-background bg-muted-foreground/30 ring-2 ring-transparent transition-all" />
          
          <MedicineCard 
            dose={dose} 
            onMarkTaken={onMarkTaken} 
            onClick={onMedicineClick}
          />
        </div>
      ))}
    </div>
  )
}
