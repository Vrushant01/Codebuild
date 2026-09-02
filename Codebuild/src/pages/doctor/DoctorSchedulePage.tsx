import React, { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, Save, RotateCcw, AlertCircle, LayoutDashboard, Languages } from "lucide-react"
import type { FullScheduleConfig } from "../../lib/doctor/doctor-schedule-service"
import { scheduleService } from "../../lib/doctor/doctor-schedule-service"
import type { BookedSlot } from "../../lib/doctor/schedule-engine"
import { generateSlots, detectConflicts } from "../../lib/doctor/schedule-engine"
import { WeeklyScheduleEditor } from "../../components/schedule/WeeklyScheduleEditor"
import { BreakManager } from "../../components/schedule/BreakManager"
import { UnavailabilityManager } from "../../components/schedule/UnavailabilityManager"
import { LeaveManager } from "../../components/schedule/LeaveManager"
import { SlotPreviewPanel } from "../../components/schedule/SlotPreviewPanel"
import { ScheduleLegend } from "../../components/schedule/ScheduleLegend"
import { Button } from "../../components/ui/button"

export default function DoctorSchedulePage() {
  const [config, setConfig] = useState<FullScheduleConfig | null>(null)
  const [originalConfig, setOriginalConfig] = useState<FullScheduleConfig | null>(null)
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  
  const [previewDate, setPreviewDate] = useState(() => new Date().toISOString().split("T")[0])
  const [previewFilter, setPreviewFilter] = useState<"ALL" | "AVAILABLE" | "BOOKED" | "BREAK" | "UNAVAILABLE">("ALL")
  const [gujaratiMode, setGujaratiMode] = useState(false)
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [cfg, bookings] = await Promise.all([
        scheduleService.getConfig(),
        scheduleService.getBookedSlots()
      ])
      setConfig(cfg)
      setOriginalConfig(JSON.parse(JSON.stringify(cfg)))
      setBookedSlots(bookings)
      setLoading(false)
    }
    loadData()
  }, [])
  
  const hasUnsavedChanges = useMemo(() => {
    if (!config || !originalConfig) return false
    return JSON.stringify(config) !== JSON.stringify(originalConfig)
  }, [config, originalConfig])
  
  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    
    const conflicts = detectConflicts(config.breaks, config.unavailability, config.defaultHours.start, config.defaultHours.end)
    if (conflicts.length > 0) {
      setSaveError(gujaratiMode ? "કૃપા કરીને સાચવતા પહેલા સમયપત્રક સંઘર્ષો ઉકેલો." : "Please resolve schedule conflicts before saving.")
      setSaving(false)
      return
    }

    try {
      await scheduleService.saveConfig(config)
      setOriginalConfig(JSON.parse(JSON.stringify(config)))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || (gujaratiMode ? "સમયપત્રક સાચવી શકાયું નથી." : "Schedule couldn't be saved."))
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const msg = gujaratiMode ? "તમારા સાચવેલા ફેરફારોને કાઢી નાખો?" : "Discard your unsaved schedule changes?"
    if (window.confirm(msg)) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)))
      setSaveError(null)
    }
  }

  // Generate slots for preview
  const generatedSlots = useMemo(() => {
    if (!config) return []
    const isOnLeave = scheduleService.isOnLeave(config, previewDate)
    const effectiveHours = scheduleService.getHoursForDate(config, previewDate)
    
    if (!effectiveHours && !isOnLeave) return [] // Day off
    
    return generateSlots({
      startTime: effectiveHours?.start || "00:00",
      endTime: effectiveHours?.end || "00:00",
      durationMinutes: config.appointmentDurationMinutes,
      breaks: config.breaks,
      unavailability: config.unavailability,
      bookedSlots,
      leaveDate: isOnLeave,
      date: previewDate
    })
  }, [config, previewDate, bookedSlots])
  
  // Weekly slot calculation
  const weeklySlots = useMemo(() => {
    if (!config) return 0
    let count = 0
    const days: (keyof typeof config.workingDays)[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for (const day of days) {
      if (config.workingDays[day]) {
        const hours = config.dayHours[day] || config.defaultHours
        const dailySlots = generateSlots({
          startTime: hours.start,
          endTime: hours.end,
          durationMinutes: config.appointmentDurationMinutes,
          breaks: config.breaks,
          unavailability: [],
          bookedSlots: [],
          leaveDate: false,
          date: "2026-09-01" // arbitrary date for theoretical count
        })
        count += dailySlots.length
      }
    }
    return count
  }, [config])

  const activeDaysCount = config ? Object.values(config.workingDays).filter(Boolean).length : 0
  
  if (loading || !config) {
    return <div className="p-8 animate-pulse text-center">{gujaratiMode ? "સમયપત્રક લોડ થઈ રહ્યું છે..." : "Loading Schedule Studio..."}</div>
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Save Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] p-4 animate-in slide-in-from-bottom">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold text-sm sm:text-base">
                {gujaratiMode ? "સાચવેલા ફેરફારો" : "Unsaved changes"}
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} disabled={saving} className="rounded-xl flex-1 sm:flex-none">
                {gujaratiMode ? "કાઢી નાખો" : "Discard changes"}
              </Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 shadow-md flex-1 sm:flex-none">
                {saving ? (gujaratiMode ? "સાચવી રહ્યું છે..." : "Saving...") : (gujaratiMode ? "સમયપત્રક સાચવો" : "Save schedule")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black">
              {gujaratiMode ? "મારું સમયપત્રક" : "My Schedule"}
            </h1>
            <p className="text-muted-foreground mt-1 sm:text-lg">
              {gujaratiMode ? "દર્દીઓ ક્યારે એપોઇન્ટમેન્ટ બુક કરી શકે છે તેનું નિયંત્રણ કરો." : "Control when patients can book appointments with you."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setGujaratiMode(!gujaratiMode)} className="w-fit rounded-full gap-2">
            <Languages className="w-4 h-4" />
            {gujaratiMode ? "English" : "ગુજરાતી"}
          </Button>
        </div>

        {/* Top Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              {gujaratiMode ? "કામના દિવસો" : "Working days"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {activeDaysCount} <span className="text-sm sm:text-base font-semibold text-muted-foreground">{gujaratiMode ? "દિવસો" : "days"}</span>
            </div>
          </div>
          <div className="bg-card border rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              {gujaratiMode ? "દૈનિક કલાકો" : "Daily hours"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground truncate">
              {config.defaultHours.start} – {config.defaultHours.end}
            </div>
          </div>
          <div className="bg-card border rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              {gujaratiMode ? "એપોઇન્ટમેન્ટ સમય" : "Appointment duration"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {config.appointmentDurationMinutes} <span className="text-sm sm:text-base font-semibold text-muted-foreground">{gujaratiMode ? "મિનિટ" : "min"}</span>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              {gujaratiMode ? "સાપ્તાહિક સ્લોટ્સ" : "Weekly availability"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {weeklySlots} <span className="text-sm sm:text-base font-semibold">{gujaratiMode ? "સ્લોટ્સ" : "slots"}</span>
            </div>
          </div>
        </div>

        {/* Global Error/Success */}
        {saveError && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-400 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{gujaratiMode ? "સમયપત્રક સંઘર્ષ" : "Schedule conflict"}</p>
              <p className="text-sm font-medium">{saveError}</p>
            </div>
          </div>
        )}
        {saveSuccess && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 flex gap-3 text-emerald-700 dark:text-emerald-400 animate-in fade-in">
            <LayoutDashboard className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{gujaratiMode ? "સમયપત્રક અપડેટ થયું." : "Schedule updated."}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">
          {/* Left: Configuration */}
          <div className="w-full xl:flex-1 space-y-6">
            <WeeklyScheduleEditor config={config} onChange={setConfig} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BreakManager config={config} onChange={setConfig} />
              <UnavailabilityManager config={config} onChange={setConfig} />
            </div>
            <LeaveManager config={config} onChange={setConfig} />
          </div>

          {/* Right: Live Preview */}
          <div className="w-full xl:w-[420px] shrink-0 sticky top-6">
            <div className="bg-card border rounded-3xl p-5 shadow-sm">
              <h3 className="font-bold flex items-center justify-between mb-4">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> 
                  {gujaratiMode ? "ઉપલબ્ધતા પૂર્વાવલોકન" : "Availability Preview"}
                </span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                  {gujaratiMode ? "જીવંત" : "LIVE"}
                </span>
              </h3>
              
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <input 
                    type="date"
                    value={previewDate}
                    onChange={e => setPreviewDate(e.target.value)}
                    className="w-full bg-muted border-none rounded-xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                {generatedSlots.length === 0 && (
                   <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl text-center font-medium border border-dashed">
                     {gujaratiMode ? "આ તારીખ માટે કોઈ સ્લોટ્સ ઉપલબ્ધ નથી." : "No appointment slots available."}
                   </p>
                )}
              </div>

              {generatedSlots.length > 0 && (
                <SlotPreviewPanel 
                  slots={generatedSlots} 
                  date={previewDate} 
                  filter={previewFilter}
                  onFilterChange={setPreviewFilter}
                />
              )}
              
              <div className="mt-6 pt-6 border-t border-border/60">
                <ScheduleLegend />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
