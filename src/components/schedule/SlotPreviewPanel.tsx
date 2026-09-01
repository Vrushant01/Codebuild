import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import type { ScheduleSlot } from "../../lib/doctor/schedule-engine"
import { SlotStatusPill } from "./ScheduleLegend"
import { Clock, Zap, Coffee, Ban, Calendar, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface SlotPreviewPanelProps {
  slots: ScheduleSlot[]
  date: string
  isLoading?: boolean
  filter?: "ALL" | "AVAILABLE" | "BOOKED" | "BREAK" | "UNAVAILABLE"
  onFilterChange?: (f: "ALL" | "AVAILABLE" | "BOOKED" | "BREAK" | "UNAVAILABLE") => void
}

function slotIcon(status: ScheduleSlot["status"]) {
  switch (status) {
    case "AVAILABLE":   return <Zap className="w-3 h-3 text-emerald-500" aria-hidden />
    case "BOOKED":      return <Clock className="w-3 h-3 text-primary" aria-hidden />
    case "BREAK":       return <Coffee className="w-3 h-3 text-amber-500" aria-hidden />
    case "UNAVAILABLE": return <Ban className="w-3 h-3 text-muted-foreground" aria-hidden />
    case "LEAVE":       return <Calendar className="w-3 h-3 text-rose-500" aria-hidden />
  }
}

// Current time to 24hr string
function nowTime24(): string {
  const n = new Date()
  return `${n.getHours().toString().padStart(2,"0")}:${n.getMinutes().toString().padStart(2,"0")}`
}

export function SlotPreviewPanel({ slots, date, isLoading, filter = "ALL", onFilterChange }: SlotPreviewPanelProps) {
  const navigate   = useNavigate()
  const now24      = useMemo(() => nowTime24(), [])
  const todayStr   = new Date().toISOString().split("T")[0]
  const isToday    = date === todayStr

  const filtered = filter === "ALL" ? slots : slots.filter(s => s.status === filter)

  const counts = useMemo(() => {
    const c = { AVAILABLE: 0, BOOKED: 0, BREAK: 0, UNAVAILABLE: 0, LEAVE: 0 }
    for (const s of slots) c[s.status]++
    return c
  }, [slots])

  const FILTERS: Array<"ALL" | "AVAILABLE" | "BOOKED" | "BREAK" | "UNAVAILABLE"> = ["ALL", "AVAILABLE", "BOOKED", "BREAK", "UNAVAILABLE"]

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-muted rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-2.5">
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{counts.AVAILABLE}</div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Available</div>
        </div>
        <div className="bg-primary/5 rounded-2xl p-2.5">
          <div className="text-lg font-bold text-primary">{counts.BOOKED}</div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Booked</div>
        </div>
        <div className="bg-muted/50 rounded-2xl p-2.5">
          <div className="text-lg font-bold text-muted-foreground">{counts.BREAK + counts.UNAVAILABLE}</div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Blocked</div>
        </div>
      </div>

      {/* Filter pills */}
      {onFilterChange && (
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => onFilterChange(f)}
              className={cn(
                "text-[11px] font-bold px-3 py-1 rounded-full border transition-all",
                filter === f
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground"
              )}>
              {f === "ALL" ? `All (${slots.length})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${counts[f as keyof typeof counts]})`}
            </button>
          ))}
        </div>
      )}

      {/* Slot list */}
      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-8 border border-dashed rounded-2xl">
            No slots to show.
          </p>
        ) : (
          filtered.map((slot, idx) => {
            const isPast = isToday && slot.time24 < now24
            const isNow  = isToday && Math.abs(parseInt(slot.time24.replace(":","")) - parseInt(now24.replace(":","")))<30

            return (
              <div
                key={idx}
                role="listitem"
                aria-label={`${slot.timeStr}, ${slot.status.toLowerCase()}`}
                onClick={() => slot.status === "BOOKED" && slot.appointmentId && navigate(`/app/doctor/appointments/${slot.appointmentId}`)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all group",
                  slot.status === "AVAILABLE"   && "bg-background border-border hover:border-emerald-300",
                  slot.status === "BOOKED"       && "bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10",
                  slot.status === "BREAK"        && "bg-amber-50/60 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30",
                  slot.status === "UNAVAILABLE"  && "bg-muted/40 border-transparent",
                  slot.status === "LEAVE"        && "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30",
                  isPast && slot.status === "AVAILABLE" && "opacity-40",
                )}
              >
                <div className="flex items-center gap-2.5">
                  {slotIcon(slot.status)}
                  <span className={cn(
                    "text-sm font-semibold tabular-nums",
                    isPast && "text-muted-foreground"
                  )}>
                    {slot.timeStr}
                  </span>
                  {isNow && slot.status !== "LEAVE" && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">NOW</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <SlotStatusPill status={slot.status} label={slot.label} />
                  {slot.status === "BOOKED" && (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
