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
      <div className={cn("flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border", className)}>
        <CalendarOff className="w-3.5 h-3.5" />
        {t("map.fullyBooked") || "Fully booked"}
      </div>
    )
  }

  if (status === "limited") {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-900", className)}>
        <Clock className="w-3.5 h-3.5" />
        {t("map.limitedSlots") || "Limited slots"}
        {showNextAvailable && <span className="font-normal opacity-80 ml-0.5 border-l border-amber-300 dark:border-amber-700/50 pl-1.5">{showNextAvailable}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-900", className)}>
      <CheckCircle2 className="w-3.5 h-3.5" />
      {t("map.available") || "Available"}
      {showNextAvailable && <span className="font-normal opacity-80 ml-0.5 border-l border-emerald-300 dark:border-emerald-700/50 pl-1.5">{showNextAvailable}</span>}
    </div>
  )
}
