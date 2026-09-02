import React, { useState } from "react"
import type { Break } from "../../lib/doctor/schedule-engine"
import type { FullScheduleConfig } from "../../lib/doctor/doctor-schedule-service"
import { Coffee, Plus, Trash2, AlertCircle } from "lucide-react"
import { detectConflicts } from "../../lib/doctor/schedule-engine"
import { cn } from "../../lib/utils"

interface BreakManagerProps {
  config: FullScheduleConfig
  onChange: (config: FullScheduleConfig) => void
}

export function BreakManager({ config, onChange }: BreakManagerProps) {
  const [addingBreak, setAddingBreak] = useState(false)
  const [newBreak, setNewBreak]       = useState<Break>({ start: "13:00", end: "14:00", label: "Lunch break" })

  const conflicts = detectConflicts(config.breaks, [], config.defaultHours.start, config.defaultHours.end)

  const addBreak = () => {
    if (newBreak.end <= newBreak.start) return
    onChange({ ...config, breaks: [...config.breaks, { ...newBreak }] })
    setAddingBreak(false)
    setNewBreak({ start: "13:00", end: "14:00", label: "" })
  }

  const removeBreak = (idx: number) => {
    onChange({ ...config, breaks: config.breaks.filter((_, i) => i !== idx) })
  }

  const updateBreak = (idx: number, field: keyof Break, value: string) => {
    const next = config.breaks.map((b, i) => i === idx ? { ...b, [field]: value } : b)
    onChange({ ...config, breaks: next })
  }

  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Coffee className="w-4 h-4 text-amber-500" /> Break Times
        </h3>
        <button
          onClick={() => setAddingBreak(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Break
        </button>
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-3 space-y-1">
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Existing breaks */}
      <div className="space-y-2">
        {config.breaks.length === 0 && !addingBreak && (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-2xl">
            No breaks configured. Patients can book all slots continuously.
          </p>
        )}
        {config.breaks.map((brk, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-3">
            <div className="flex gap-2 items-center flex-1">
              <Coffee className="w-4 h-4 text-amber-500 shrink-0" />
              <input
                type="time"
                value={brk.start}
                aria-label="Break start time"
                onChange={e => updateBreak(idx, "start", e.target.value)}
                className="bg-background border rounded-lg px-3 py-1.5 text-sm font-medium w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-muted-foreground text-sm font-medium shrink-0">to</span>
              <input
                type="time"
                value={brk.end}
                aria-label="Break end time"
                onChange={e => updateBreak(idx, "end", e.target.value)}
                className="bg-background border rounded-lg px-3 py-1.5 text-sm font-medium w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={brk.label || ""}
                aria-label="Break label"
                placeholder="Label (optional)"
                onChange={e => updateBreak(idx, "label", e.target.value)}
                className="bg-background border rounded-lg px-3 py-1.5 text-sm w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => removeBreak(idx)}
                aria-label="Remove break"
                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add break form */}
      {addingBreak && (
        <div className="border-2 border-dashed border-primary/30 rounded-2xl p-4 space-y-3 bg-primary/5">
          <h4 className="text-sm font-bold text-primary">New Break</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Start</label>
              <input type="time" value={newBreak.start}
                onChange={e => setNewBreak(p => ({ ...p, start: e.target.value }))}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">End</label>
              <input type="time" value={newBreak.end}
                onChange={e => setNewBreak(p => ({ ...p, end: e.target.value }))}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <input type="text" value={newBreak.label || ""}
            onChange={e => setNewBreak(p => ({ ...p, label: e.target.value }))}
            placeholder="Label e.g. Lunch break (optional)"
            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {newBreak.end <= newBreak.start && (
            <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> End must be after start.</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setAddingBreak(false)} className="flex-1 py-2 text-sm font-semibold rounded-xl border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button onClick={addBreak} disabled={newBreak.end <= newBreak.start}
              className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-colors",
                newBreak.end <= newBreak.start
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}>
              Add break
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
