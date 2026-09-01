import React from "react"
import type { FullScheduleConfig, WorkingDays } from "../../lib/doctor/doctor-schedule-service"
import { cn } from "../../lib/utils"

const DAY_META: Array<{ key: keyof WorkingDays; short: string; full: string }> = [
  { key: "monday",    short: "Mo", full: "Monday" },
  { key: "tuesday",   short: "Tu", full: "Tuesday" },
  { key: "wednesday", short: "We", full: "Wednesday" },
  { key: "thursday",  short: "Th", full: "Thursday" },
  { key: "friday",    short: "Fr", full: "Friday" },
  { key: "saturday",  short: "Sa", full: "Saturday" },
  { key: "sunday",    short: "Su", full: "Sunday" },
]

type Preset = "mon-fri" | "mon-sat" | "all"

interface WeeklyScheduleEditorProps {
  config: FullScheduleConfig
  onChange: (config: FullScheduleConfig) => void
}

export function WeeklyScheduleEditor({ config, onChange }: WeeklyScheduleEditorProps) {

  const applyPreset = (preset: Preset) => {
    const days: WorkingDays = {
      monday: preset !== "all" || true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: preset === "mon-sat" || preset === "all",
      sunday: preset === "all",
    }
    // mon-fri
    if (preset === "mon-fri") {
      days.saturday = false
      days.sunday   = false
    }
    onChange({ ...config, workingDays: days })
  }

  const toggleDay = (day: keyof WorkingDays) => {
    onChange({
      ...config,
      workingDays: { ...config.workingDays, [day]: !config.workingDays[day] }
    })
  }

  const updateDayHours = (day: keyof WorkingDays, field: "start" | "end", value: string) => {
    const existing = config.dayHours[day] || config.defaultHours
    onChange({
      ...config,
      dayHours: { ...config.dayHours, [day]: { ...existing, [field]: value } }
    })
  }

  const clearDayOverride = (day: keyof WorkingDays) => {
    const next = { ...config.dayHours }
    delete next[day]
    onChange({ ...config, dayHours: next })
  }

  const updateDefaultHours = (field: "start" | "end", value: string) => {
    onChange({ ...config, defaultHours: { ...config.defaultHours, [field]: value } })
  }

  const updateDuration = (val: number) => {
    onChange({ ...config, appointmentDurationMinutes: val })
  }

  const activeCount = Object.values(config.workingDays).filter(Boolean).length

  return (
    <div className="space-y-5">

      {/* Preset quick-select */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Quick presets</h3>
        <div className="flex flex-wrap gap-2">
          {([
            { label: "Mon – Fri", value: "mon-fri" as Preset },
            { label: "Mon – Sat", value: "mon-sat" as Preset },
            { label: "Every day", value: "all" as Preset },
          ] as const).map(p => (
            <button key={p.value} onClick={() => applyPreset(p.value)}
              className="px-4 py-2 text-sm font-semibold rounded-2xl border border-border bg-muted/30 hover:bg-muted transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day toggles */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            Working Days
          </h3>
          <span className="text-sm font-semibold text-muted-foreground">{activeCount} day{activeCount !== 1 ? "s" : ""}</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DAY_META.map(day => {
            const isOn = config.workingDays[day.key]
            return (
              <button
                key={day.key}
                onClick={() => toggleDay(day.key)}
                aria-pressed={isOn}
                aria-label={`${day.full}: ${isOn ? "working" : "off"}`}
                className={cn(
                  "flex flex-col items-center justify-center h-14 rounded-2xl font-bold text-sm transition-all select-none",
                  isOn
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="text-xs">{day.short}</span>
                <span className={cn("text-[9px] font-normal mt-0.5", isOn ? "text-primary-foreground/80" : "text-muted-foreground/60")}>
                  {isOn ? "On" : "Off"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Default hours */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold mb-4">Default Working Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="default-start" className="block text-sm font-semibold text-muted-foreground mb-1.5">Start time</label>
            <input
              id="default-start"
              type="time"
              value={config.defaultHours.start}
              onChange={e => updateDefaultHours("start", e.target.value)}
              className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="default-end" className="block text-sm font-semibold text-muted-foreground mb-1.5">End time</label>
            <input
              id="default-end"
              type="time"
              value={config.defaultHours.end}
              onChange={e => updateDefaultHours("end", e.target.value)}
              className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Per-day hour overrides — only for active days with non-default hours */}
      {DAY_META.filter(d => config.workingDays[d.key]).map(day => {
        const override = config.dayHours[day.key]
        const hours    = override || config.defaultHours
        const hasDiff  = !!override

        return (
          <div key={day.key} className={cn(
            "bg-card border rounded-3xl p-4 shadow-sm transition-all",
            hasDiff && "border-primary/30 bg-primary/5 dark:bg-primary/5"
          )}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm">{day.full}</h4>
              <div className="flex items-center gap-2">
                {hasDiff && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Custom</span>
                )}
                {hasDiff && (
                  <button onClick={() => clearDayOverride(day.key)} className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-semibold">
                    Reset to default
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Start time</label>
                <input
                  type="time"
                  value={hours.start}
                  aria-label={`${day.full} start time`}
                  onChange={e => updateDayHours(day.key, "start", e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">End time</label>
                <input
                  type="time"
                  value={hours.end}
                  aria-label={`${day.full} end time`}
                  onChange={e => updateDayHours(day.key, "end", e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>
        )
      })}

      {/* Appointment Duration */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold mb-4">Appointment Duration</h3>
        <div className="grid grid-cols-4 gap-2">
          {[15, 30, 45, 60].map(min => (
            <button
              key={min}
              onClick={() => updateDuration(min)}
              aria-pressed={config.appointmentDurationMinutes === min}
              className={cn(
                "py-3 rounded-2xl text-sm font-bold border transition-all",
                config.appointmentDurationMinutes === min
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "bg-muted/30 text-foreground border-border hover:bg-muted"
              )}
            >
              {min} min
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Each patient appointment slot will be {config.appointmentDurationMinutes} minutes long.
        </p>
      </div>
    </div>
  )
}
