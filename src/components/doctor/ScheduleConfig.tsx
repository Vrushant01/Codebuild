import React, { useState } from "react"
import { Calendar, Clock, Save, Coffee, AlertCircle } from "lucide-react"
import type { ScheduleConfig, GeneratedSlot } from "../../lib/doctor/doctor-types"
import { doctorScheduleService } from "../../lib/doctor/doctor-schedule-service"
import { Button } from "../ui/button"

interface ScheduleConfigProps {
  initialConfig: ScheduleConfig
  onConfigSaved: () => void
}

export function ScheduleConfigUI({ initialConfig, onConfigSaved }: ScheduleConfigProps) {
  const [config, setConfig] = useState<ScheduleConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [conflict, setConflict] = useState<string | null>(null)
  const [previewDate, setPreviewDate] = useState(() => new Date().toISOString().split("T")[0])
  const [generatedSlots, setGeneratedSlots] = useState<GeneratedSlot[]>([])

  const DAYS = [
    { key: "monday", label: "M" },
    { key: "tuesday", label: "T" },
    { key: "wednesday", label: "W" },
    { key: "thursday", label: "T" },
    { key: "friday", label: "F" },
    { key: "saturday", label: "S" },
    { key: "sunday", label: "S" }
  ]

  const generatePreview = async () => {
    // Generate slots via service mock
    const slots = await doctorScheduleService.generateSlots(previewDate)
    setGeneratedSlots(slots)
  }

  React.useEffect(() => {
    generatePreview()
  }, [config, previewDate])

  const handleDayToggle = (day: string) => {
    setConfig(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day as keyof typeof prev.workingDays]
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setConflict(null)
    
    // Simulate simple overlap conflict check
    const { start, end } = config.workingHours
    for (const brk of config.breaks) {
      if (brk.start < start || brk.end > end) {
        setConflict("Schedule conflict detected: Break time is outside working hours.")
        setSaving(false)
        return
      }
    }

    await doctorScheduleService.updateConfig(config)
    setSaving(false)
    onConfigSaved()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Editor */}
      <div className="flex-1 space-y-6">
        
        {/* Working Days */}
        <div className="bg-card border rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" /> Working Days
          </h3>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => {
              const isActive = config.workingDays[day.key as keyof typeof config.workingDays]
              return (
                <button
                  key={day.key}
                  onClick={() => handleDayToggle(day.key)}
                  className={`w-12 h-12 rounded-full font-bold transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Working Hours & Duration */}
        <div className="bg-card border rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" /> Working Hours & Duration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">Start Time</label>
              <input 
                type="time" 
                value={config.workingHours.start}
                onChange={e => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">End Time</label>
              <input 
                type="time" 
                value={config.workingHours.end}
                onChange={e => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium"
              />
            </div>
            <div className="sm:col-span-2 mt-2">
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">Slot Duration (Minutes)</label>
              <select 
                value={config.appointmentDurationMinutes}
                onChange={e => setConfig({ ...config, appointmentDurationMinutes: Number(e.target.value) })}
                className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>
        </div>

        {/* Breaks */}
        <div className="bg-card border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-500" /> Break Times
            </h3>
            <button 
              onClick={() => setConfig({ ...config, breaks: [...config.breaks, { start: "13:00", end: "14:00" }] })}
              className="text-sm font-bold text-primary hover:underline"
            >
              + Add Break
            </button>
          </div>
          
          <div className="space-y-3">
            {config.breaks.map((brk, idx) => (
              <div key={idx} className="flex gap-3 items-center bg-muted/30 p-3 rounded-2xl border">
                <input 
                  type="time" 
                  value={brk.start}
                  onChange={e => {
                    const newBreaks = [...config.breaks]
                    newBreaks[idx].start = e.target.value
                    setConfig({ ...config, breaks: newBreaks })
                  }}
                  className="bg-background border rounded-lg px-3 py-1.5 text-sm font-medium w-full"
                />
                <span className="text-muted-foreground">to</span>
                <input 
                  type="time" 
                  value={brk.end}
                  onChange={e => {
                    const newBreaks = [...config.breaks]
                    newBreaks[idx].end = e.target.value
                    setConfig({ ...config, breaks: newBreaks })
                  }}
                  className="bg-background border rounded-lg px-3 py-1.5 text-sm font-medium w-full"
                />
                <button 
                  onClick={() => setConfig({ ...config, breaks: config.breaks.filter((_, i) => i !== idx) })}
                  className="text-destructive font-bold p-2 hover:bg-destructive/10 rounded-lg shrink-0 text-xs"
                >
                  REMOVE
                </button>
              </div>
            ))}
            {config.breaks.length === 0 && (
              <p className="text-sm text-muted-foreground">No breaks configured.</p>
            )}
          </div>
        </div>

        {/* Error / Conflict */}
        {conflict && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{conflict}</span>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full py-6 rounded-2xl text-lg font-bold">
          {saving ? "Saving Configuration..." : "Save Schedule"} <Save className="w-5 h-5 ml-2" />
        </Button>

      </div>

      {/* Preview Timeline */}
      <div className="w-full lg:w-[340px] shrink-0">
        <div className="bg-card border rounded-3xl p-5 shadow-sm sticky top-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            Preview Slots
          </h3>
          <input 
            type="date"
            value={previewDate}
            onChange={e => setPreviewDate(e.target.value)}
            className="w-full bg-muted border-none rounded-xl px-4 py-2.5 font-medium mb-4 text-sm"
          />

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {generatedSlots.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8 border border-dashed rounded-2xl">
                No slots available on this day.
              </p>
            ) : (
              generatedSlots.map((slot, idx) => (
                <div key={idx} className={`flex justify-between items-center p-3 rounded-xl border text-sm font-medium ${
                  slot.status === "Available" ? "bg-background" :
                  slot.status === "Booked" ? "bg-primary/5 text-primary border-primary/20" :
                  "bg-muted/50 text-muted-foreground border-transparent"
                }`}>
                  <span>{slot.timeStr}</span>
                  <span className={`text-xs uppercase tracking-wider font-bold ${
                    slot.status === "Available" ? "text-emerald-500" :
                    slot.status === "Booked" ? "text-primary" :
                    "text-muted-foreground"
                  }`}>
                    {slot.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}
