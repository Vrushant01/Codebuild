import React, { useState } from "react"
import type { FullScheduleConfig } from "../../lib/doctor/doctor-schedule-service"
import { Calendar, Plus, Trash2, AlertCircle, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

interface LeaveManagerProps {
  config: FullScheduleConfig
  onChange: (config: FullScheduleConfig) => void
  bookedDates?: string[] // dates with existing bookings
}

export function LeaveManager({ config, onChange, bookedDates = [] }: LeaveManagerProps) {
  const [mode, setMode]       = useState<"single" | "range">("single")
  const [adding, setAdding]   = useState(false)
  const [date, setDate]       = useState("")
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd]     = useState("")
  const [reason, setReason]   = useState("")
  const [err, setErr]         = useState("")
  const [warn, setWarn]       = useState<string | null>(null)

  const todayStr = new Date().toISOString().split("T")[0]

  // Collect all leave dates for checking conflicts
  const allLeaveDates = [
    ...config.leaves,
    ...config.leaveRanges.flatMap(r => {
      const dates: string[] = []
      const cur = new Date(r.start)
      const end = new Date(r.end)
      while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate() + 1) }
      return dates
    })
  ]

  const checkBookingConflict = (datesToCheck: string[]): number => {
    return datesToCheck.filter(d => bookedDates.includes(d)).length
  }

  const addLeave = () => {
    setErr("")
    if (mode === "single") {
      if (!date) { setErr("Please select a date."); return }
      if (allLeaveDates.includes(date)) { setErr("Leave already exists for this date."); return }
      const conflicts = checkBookingConflict([date])
      if (conflicts > 0 && !warn) {
        setWarn(`${conflicts} appointment${conflicts > 1 ? "s are" : " is"} already scheduled on this date.`)
        return
      }
      onChange({ ...config, leaves: [...config.leaves, date] })
    } else {
      if (!rangeStart || !rangeEnd) { setErr("Please select start and end dates."); return }
      if (rangeEnd < rangeStart) { setErr("End date must be after start."); return }
      const conflicts = checkBookingConflict(
        Array.from({ length: (new Date(rangeEnd).getTime() - new Date(rangeStart).getTime()) / 86400000 + 1 }, (_, i) => {
          const d = new Date(rangeStart); d.setDate(d.getDate() + i); return d.toISOString().split("T")[0]
        })
      )
      if (conflicts > 0 && !warn) {
        setWarn(`${conflicts} appointment${conflicts > 1 ? "s are" : " is"} already scheduled during this leave range.`)
        return
      }
      onChange({ ...config, leaveRanges: [...config.leaveRanges, { start: rangeStart, end: rangeEnd, reason }] })
    }
    setAdding(false); setDate(""); setRangeStart(""); setRangeEnd(""); setReason(""); setWarn(null)
  }

  const removeSingleLeave = (d: string) => onChange({ ...config, leaves: config.leaves.filter(l => l !== d) })
  const removeRangeLeave  = (i: number)  => onChange({ ...config, leaveRanges: config.leaveRanges.filter((_, j) => j !== i) })

  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-500" /> Leave Management
        </h3>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
          <Plus className="w-4 h-4" /> Add Leave
        </button>
      </div>

      {/* Existing leaves */}
      <div className="space-y-2">
        {config.leaves.length === 0 && config.leaveRanges.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-2xl">
            No leave days configured.
          </p>
        )}
        {config.leaves.map(d => (
          <div key={d} className="flex items-center justify-between gap-3 bg-rose-50/60 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>{d}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-full">Leave</span>
            </div>
            <button onClick={() => removeSingleLeave(d)} aria-label="Remove leave" className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {config.leaveRanges.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 bg-rose-50/60 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{r.start} → {r.end}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-full">Range</span>
              </div>
              {r.reason && <p className="text-xs text-muted-foreground mt-0.5 ml-6">{r.reason}</p>}
            </div>
            <button onClick={() => removeRangeLeave(i)} aria-label="Remove leave range" className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add leave form */}
      {adding && (
        <div className="border-2 border-dashed border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold">Add Leave</h4>

          {/* Mode toggle */}
          <div className="flex gap-1.5 p-1 bg-muted rounded-xl w-fit">
            {(["single", "range"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                  mode === m ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {m === "single" ? "Single day" : "Date range"}
              </button>
            ))}
          </div>

          {mode === "single" ? (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Date</label>
              <input type="date" value={date} min={todayStr}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">From</label>
                <input type="date" value={rangeStart} min={todayStr}
                  onChange={e => setRangeStart(e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">To</label>
                <input type="date" value={rangeEnd} min={rangeStart || todayStr}
                  onChange={e => setRangeEnd(e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          <input type="text" value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason (private, not shown to patients)"
            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {err && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {err}</p>}

          {/* Booking conflict warning */}
          {warn && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setWarn(null)} className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                  Review appointments
                </button>
                <span className="text-amber-400">·</span>
                <button onClick={() => { setWarn(null); setTimeout(addLeave, 0) }} className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">
                  Continue anyway
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setErr(""); setWarn(null) }} className="flex-1 py-2 text-sm font-semibold rounded-xl border hover:bg-muted transition-colors">Cancel</button>
            <button onClick={addLeave} className="flex-1 py-2 text-sm font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors">Add leave</button>
          </div>
        </div>
      )}
    </div>
  )
}
