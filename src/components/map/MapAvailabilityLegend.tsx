import React from "react"
import { CheckCircle2, Clock, CalendarOff } from "lucide-react"
import { useTranslation } from "../../lib/i18n/useTranslation"

export function MapAvailabilityLegend() {
  const { t } = useTranslation()

  return (
    <div className="bg-background/90 backdrop-blur shadow-sm rounded-lg border p-3 flex flex-col gap-2 pointer-events-auto">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {t("map.availabilityLegend") || "Availability"}
      </h4>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>{t("map.available") || "Available"}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Clock className="w-4 h-4 text-amber-500" />
        <span>{t("map.limitedSlots") || "Limited slots"}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarOff className="w-4 h-4" />
        <span>{t("map.fullyBooked") || "Fully booked"}</span>
      </div>
    </div>
  )
}
