import React, { useRef, useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "../../lib/utils"
import type { DailyAvailability } from "../../lib/booking/appointment-types"

interface DateSelectorProps {
  availability: DailyAvailability[]
  selectedDate: string | null
  onDateSelect: (date: string) => void
  isLoading: boolean
}

export function DateSelector({ availability, selectedDate, onDateSelect, isLoading }: DateSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showCalendarModal, setShowCalendarModal] = useState(false)

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden py-1">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="w-[4.75rem] h-24 rounded-2xl bg-muted animate-pulse shrink-0" />
        ))}
      </div>
    )
  }

  const todayStr = new Date().toISOString().split("T")[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 60)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  return (
    <div className="relative group">
      {/* Scroll Navigation Arrows */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Available dates</span>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {availability.length} Days
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous dates"
            className="p-1.5 rounded-lg border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next dates"
            className="p-1.5 rounded-lg border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Rail */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 -mx-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 snap-x scroll-smooth"
      >
        {availability.map((day) => {
          const dateObj = new Date(day.date + "T00:00:00")
          const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
          const dayNumber = dateObj.getDate()
          const monthName = dateObj.toLocaleDateString("en-US", { month: "short" })

          const isSelected = selectedDate === day.date

          return (
            <button
              key={day.date}
              type="button"
              disabled={!day.isAvailable}
              onClick={() => onDateSelect(day.date)}
              className={cn(
                "snap-start shrink-0 w-[4.75rem] flex flex-col items-center py-3.5 rounded-2xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none",
                !day.isAvailable
                  ? "opacity-40 bg-muted/60 border-transparent cursor-not-allowed"
                  : isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                    : "border-border/80 bg-card hover:border-primary/50 text-foreground hover:bg-accent/60 active:scale-95 shadow-sm"
              )}
            >
              <span className={cn("text-[10px] font-bold tracking-wider mb-1", isSelected ? "text-primary-foreground/90" : "text-muted-foreground")}>
                {dayName}
              </span>
              <span className="text-2xl font-heading font-black leading-none mb-1">
                {dayNumber}
              </span>
              <span className={cn("text-[10px] font-bold uppercase", isSelected ? "text-primary-foreground/90" : "text-muted-foreground")}>
                {monthName}
              </span>

              {/* Status dot indicator */}
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mt-2 transition-all",
                !day.isAvailable 
                  ? "bg-transparent"
                  : isSelected 
                    ? "bg-white ring-2 ring-white/30" 
                    : "bg-emerald-500"
              )} />
            </button>
          )
        })}

        {/* Interactive "More Dates" Calendar Button */}
        <button
          type="button"
          onClick={() => setShowCalendarModal(true)}
          className="snap-start shrink-0 w-[4.75rem] flex flex-col items-center justify-center py-3.5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all active:scale-95 group/btn"
        >
          <CalendarIcon className="w-5 h-5 mb-1.5 group-hover/btn:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase text-center leading-tight">
            More<br />Dates
          </span>
        </button>
      </div>

      {/* Calendar Picker Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Select Custom Date</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Choose any date up to 60 days ahead for your doctor appointment.
            </p>

            <div className="space-y-2">
              <label htmlFor="custom-date-picker" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Appointment Date
              </label>
              <input
                id="custom-date-picker"
                type="date"
                min={todayStr}
                max={maxDateStr}
                value={selectedDate || todayStr}
                onChange={(e) => {
                  if (e.target.value) {
                    onDateSelect(e.target.value)
                    setShowCalendarModal(false)
                  }
                }}
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 border-2 border-border focus:border-primary text-foreground font-semibold outline-none transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
