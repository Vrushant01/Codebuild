import React from "react"
import type { Dose, Medicine } from "../../lib/schedule/schedule-types"
import { Pill, Clock, ChevronRight } from "lucide-react"

interface NextMedicineWidgetProps {
  dose: (Dose & { medicine: Medicine }) | null
  onCardClick?: () => void
}

export function NextMedicineWidget({ dose, onCardClick }: NextMedicineWidgetProps) {
  if (!dose) return null

  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Next Medicine</h3>
      
      <button 
        onClick={onCardClick}
        className="w-full text-left bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 text-white p-5 sm:p-6 rounded-2xl shadow-xl shadow-indigo-500/20 transition-transform hover:scale-[1.02] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 relative overflow-hidden group"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold leading-none mb-2">{dose.medicine.name}</h2>
            <div className="flex items-center gap-3 text-white/80 font-medium">
              <span>{dose.medicine.dosage}</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span>{dose.medicine.foodInstruction}</span>
            </div>
          </div>
          
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm shadow-inner">
            <Pill className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-sm border border-white/10">
            <Clock className="w-4 h-4" />
            Take at {dose.scheduledTime}
          </div>

          <div className="flex items-center gap-1 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200 bg-white text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm">
            View Schedule
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    </div>
  )
}
