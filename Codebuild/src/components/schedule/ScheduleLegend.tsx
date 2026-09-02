import React from "react"
import { Circle, CheckCircle, Clock, Calendar, XCircle } from "lucide-react"
import type { SlotDisplayStatus } from "../../lib/doctor/schedule-engine"

const LEGEND_ITEMS: { status: SlotDisplayStatus; label: string; colorClass: string; icon: React.ReactNode }[] = [
  {
    status: "AVAILABLE",
    label: "Available",
    colorClass: "bg-emerald-500",
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
  },
  {
    status: "BOOKED",
    label: "Booked",
    colorClass: "bg-primary",
    icon: <Circle className="w-3.5 h-3.5 text-primary fill-primary" />
  },
  {
    status: "BREAK",
    label: "Break",
    colorClass: "bg-amber-400",
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
  },
  {
    status: "UNAVAILABLE",
    label: "Unavailable",
    colorClass: "bg-muted-foreground",
    icon: <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
  },
  {
    status: "LEAVE",
    label: "Leave",
    colorClass: "bg-rose-400",
    icon: <Calendar className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
  }
]

export function ScheduleLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-3 ${compact ? "gap-x-4 gap-y-1.5" : "gap-x-5 gap-y-2"}`} role="legend" aria-label="Schedule legend">
      {LEGEND_ITEMS.map(item => (
        <div key={item.status} className="flex items-center gap-1.5">
          {item.icon}
          <span className={`${compact ? "text-xs" : "text-xs"} font-medium text-muted-foreground`}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function SlotStatusPill({ status, label }: { status: SlotDisplayStatus; label?: string }) {
  const map: Record<SlotDisplayStatus, string> = {
    AVAILABLE:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    BOOKED:      "bg-primary/10 text-primary border-primary/20",
    BREAK:       "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    UNAVAILABLE: "bg-muted text-muted-foreground border-transparent",
    LEAVE:       "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  }
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[status]}`}>
      {label || status.toLowerCase()}
    </span>
  )
}
