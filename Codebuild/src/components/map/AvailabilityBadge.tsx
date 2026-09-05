import React from "react"
import { CheckCircle2, Clock, CalendarOff } from "lucide-react"
import { cn } from "../../lib/utils"
import type { AvailabilityStatus } from "../../lib/healthcare/types"
import { useTranslation } from "../../lib/i18n/useTranslation"

interface AvailabilityBadgeProps {
  status: AvailabilityStatus
  className?: string
  showNextAvailable?: string
}

export function AvailabilityBadge({ status, className, showNextAvailable }: AvailabilityBadgeProps) {
  const { t } = useTranslation()

  if (status === "full") {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs", className)}>
        <CalendarOff className="w-3.5 h-3.5 text-slate-500" />
        {t("map.fullyBooked") || "Fully booked"}
      </div>
    )
  }

  if (status === "limited") {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700 shadow-xs", className)}>
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        {t("map.limitedSlots") || "Limited slots"}
        {showNextAvailable && <span className="font-normal opacity-80 ml-0.5 border-l border-amber-300 dark:border-amber-700/50 pl-1.5">{showNextAvailable}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700 shadow-xs", className)}>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      {t("map.available") || "Available"}
      {showNextAvailable && <span className="font-normal opacity-80 ml-0.5 border-l border-emerald-300 dark:border-emerald-700/50 pl-1.5">{showNextAvailable}</span>}
    </div>
  )
}
