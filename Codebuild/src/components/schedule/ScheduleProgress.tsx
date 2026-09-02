import React from "react"
import { CheckCircle2, CircleDashed } from "lucide-react"

interface ScheduleProgressProps {
  completedCount: number
  totalCount: number
}

export function ScheduleProgress({ completedCount, totalCount }: ScheduleProgressProps) {
  
  if (totalCount === 0) return null

  const percentage = Math.round((completedCount / totalCount) * 100)
  const isComplete = completedCount === totalCount

  return (
    <div className="bg-card border rounded-2xl p-5 mb-8 shadow-sm flex items-center justify-between gap-4">
      
      <div className="flex-1">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          {isComplete ? (
            <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Today's medicines completed</>
          ) : (
            <><CircleDashed className="w-5 h-5 text-primary" /> Today's progress</>
          )}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {completedCount} of {totalCount} doses completed
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-muted rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="text-2xl font-heading font-bold text-primary shrink-0 text-right min-w-[3rem]">
        {percentage}%
      </div>

    </div>
  )
}
