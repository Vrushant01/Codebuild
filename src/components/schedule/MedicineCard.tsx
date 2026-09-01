import React, { useState } from "react"
import type { Dose, Medicine } from "../../lib/schedule/schedule-types"
import { Pill, Clock, Utensils, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import { scheduleService } from "../../lib/schedule/schedule-service"

interface MedicineCardProps {
  dose: Dose & { medicine: Medicine }
  onMarkTaken: (id: string) => Promise<void>
  onClick?: (medicine: Medicine) => void
}

export function MedicineCard({ dose, onMarkTaken, onClick }: MedicineCardProps) {
  const { medicine, status, scheduledTime } = dose
  const [isUpdating, setIsUpdating] = useState(false)

  const handleTaken = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUpdating(true)
    try {
      await onMarkTaken(dose.id)
    } finally {
      setIsUpdating(false)
    }
  }

  const isTaken = status === "taken"
  const isMissed = status === "missed"
  const isCancelled = status === "cancelled" || medicine.status === "cancelled"
  const isActive = status === "upcoming" || status === "due"

  let statusBg = "bg-card"
  let statusBorder = "border-border"
  
  if (isTaken) {
    statusBg = "bg-emerald-50/50 dark:bg-emerald-950/20"
    statusBorder = "border-emerald-200 dark:border-emerald-900"
  } else if (isMissed) {
    statusBg = "bg-red-50/50 dark:bg-red-950/20"
    statusBorder = "border-red-200 dark:border-red-900"
  }

  return (
    <div 
      onClick={() => onClick && onClick(medicine)}
      className={cn(
        "p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6",
        statusBg, statusBorder,
        onClick ? "cursor-pointer" : "",
        isActive && "hover:border-primary/40 hover:shadow-sm"
      )}
    >
      
      {/* Time & Icon */}
      <div className="flex items-center gap-4 sm:w-32 shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
          isTaken ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" :
          isMissed ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" :
          "bg-primary/10 text-primary"
        )}>
          {isTaken ? <CheckCircle2 className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
        </div>
        <div className="font-semibold text-foreground tracking-tight">
          {scheduledTime}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h4 className={cn("text-lg font-bold truncate", isTaken || isCancelled ? "text-muted-foreground" : "text-foreground")}>
            {medicine.name}
          </h4>
          
          {/* Status Badges */}
          {medicine.source === "DOCTOR" && (
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Prescribed
            </span>
          )}
          {isMissed && (
            <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Missed
            </span>
          )}
          {isCancelled && (
            <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Cancelled
            </span>
          )}
        </div>
        
        <div className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium",
          isTaken || isCancelled ? "text-muted-foreground/70" : "text-muted-foreground"
        )}>
          <span className="flex items-center gap-1.5 bg-background/50 px-2 py-0.5 rounded-md border">
            {medicine.dosage}
          </span>
          <span className="flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5" />
            {medicine.foodInstruction}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="shrink-0 mt-2 sm:mt-0">
        {isActive && !isCancelled && (
          <Button 
            onClick={handleTaken} 
            disabled={isUpdating}
            className="w-full sm:w-auto shadow-md shadow-primary/20 hover:bg-primary/90"
          >
            {isUpdating ? "Saving..." : "Mark as taken"}
          </Button>
        )}
        
        {isTaken && dose.takenAt && (
          <div className="text-right text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 justify-end">
             <CheckCircle2 className="w-3.5 h-3.5" />
            Taken at {new Date(dose.takenAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </div>
        )}

        {isMissed && (
          <div className="text-right text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1 justify-end">
            <AlertCircle className="w-3.5 h-3.5" />
            Marked as missed
          </div>
        )}
      </div>

    </div>
  )
}
