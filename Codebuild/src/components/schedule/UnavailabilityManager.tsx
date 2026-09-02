import React, { useState } from "react"
import type { FullScheduleConfig } from "../../lib/doctor/doctor-schedule-service"
import type { UnavailabilityBlock } from "../../lib/doctor/schedule-engine"
import { Ban, Plus, Trash2, AlertCircle, Calendar } from "lucide-react"
import { cn } from "../../lib/utils"

interface UnavailabilityManagerProps {
  config: FullScheduleConfig
  onChange: (config: FullScheduleConfig) => void
}

export function UnavailabilityManager({ config, onChange }: UnavailabilityManagerProps) {
  const [adding, setAdding] = useState(false)
  const todayStr = new Date().toISOString().split("T")[0]
  const [newBlock, setNewBlock] = useState<UnavailabilityBlock>({
    date: todayStr, start: "15:00", end: "16:00", reason: ""
  })
  const [err, setErr] = useState("")

  const validate = () => {
    if (newBlock.end <= newBlock.start) return "End time must be after start."
    if (newBlock.start < config.defaultHours.start) return "Start is before working hours."
    if (newBlock.end > config.defaultHours.end) return "End is after working hours."
    return ""
  }

  const addBlock = () => {
    const e = validate()
    if (e) { setErr(e); return }
    onChange({ ...config, unavailability: [...config.unavailability, { ...newBlock }] })
    setAdding(false)
    setNewBlock({ date: todayStr, start: "15:00", end: "16:00", reason: "" })
    setErr("")
  }

  const remove = (idx: number) => {
    onChange({ ...config, unavailability: config.unavailability.filter((_, i) => i !== idx) })
  }

  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Ban className="w-4 h-4 text-muted-foreground" /> Unavailable Times
        </h3>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {config.unavailability.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-2xl">
            No unavailable blocks. All working-hour slots are available.
          </p>
        )}
        {config.unavailability.map((blk, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 bg-muted/30 border rounded-2xl p-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Ban className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold flex-wrap">
                  <span>{blk.date}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{blk.start} – {blk.end}</span>
                </div>
                {blk.reason && <p className="text-xs text-muted-foreground truncate mt-0.5">{blk.reason}</p>}
              </div>
            </div>
            <button onClick={() => remove(idx)} aria-label="Remove unavailability block"
              className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="border-2 border-dashed border-muted rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold">Mark unavailable time</h4>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Date</label>
            <input type="date" value={newBlock.date} min={todayStr}
              onChange={e => setNewBlock(p => ({ ...p, date: e.target.value }))}
              className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Start</label>
              <input type="time" value={newBlock.start}
                onChange={e => setNewBlock(p => ({ ...p, start: e.target.value }))}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">End</label>
              <input type="time" value={newBlock.end}
                onChange={e => setNewBlock(p => ({ ...p, end: e.target.value }))}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <input type="text" value={newBlock.reason || ""}
            onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))}
            placeholder="Reason (internal, not shown to patients)"
            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {err && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {err}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setErr("") }} className="flex-1 py-2 text-sm font-semibold rounded-xl border hover:bg-muted transition-colors">Cancel</button>
            <button onClick={addBlock} className="flex-1 py-2 text-sm font-bold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors">Mark unavailable</button>
          </div>
        </div>
      )}
    </div>
  )
}
