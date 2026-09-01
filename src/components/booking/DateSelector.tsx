import React from "react"
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import type { DailyAvailability } from "../../lib/booking/appointment-types"

interface DateSelectorProps {
  availability: DailyAvailability[]
  selectedDate: string | null
  onDateSelect: (date: string) => void
  isLoading: boolean
}

export function DateSelector({ availability, selectedDate, onDateSelect, isLoading }: DateSelectorProps) {
  
  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden py-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-20 h-24 rounded-2xl bg-muted animate-pulse shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Horizontal Rail for Mobile/Fast Desktop */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-1 scrollbar-hide snap-x">
        
        {availability.map((day) => {
          const dateObj = new Date(day.date)
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
          const dayNumber = dateObj.getDate()
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' })
          
          const isSelected = selectedDate === day.date
          
          return (
            <button
              key={day.date}
              disabled={!day.isAvailable}
              onClick={() => onDateSelect(day.date)}
              className={cn(
                "snap-start shrink-0 w-[4.5rem] flex flex-col items-center py-4 rounded-2xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                !day.isAvailable
                  ? "opacity-50 bg-muted border-transparent cursor-not-allowed"
                  : isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md -translate-y-1"
                    : "border-border bg-card hover:border-primary/50 text-foreground hover:bg-accent/50"
              )}
            >
              <span className={cn("text-[10px] font-bold tracking-wider mb-1", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {dayName}
              </span>
              <span className="text-2xl font-heading font-bold leading-none mb-1">
                {dayNumber}
              </span>
              <span className={cn("text-[10px] font-semibold uppercase", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {monthName}
              </span>

              {/* Status dot indicator */}
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mt-2",
                !day.isAvailable 
                  ? "bg-transparent"
                  : isSelected 
                    ? "bg-white" 
                    : "bg-emerald-500"
              )} />
            </button>
          )
        })}

        {/* Full Calendar Toggle (Mock) */}
        <button className="snap-start shrink-0 w-[4.5rem] flex flex-col items-center justify-center py-4 rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground transition-colors">
          <CalendarIcon className="w-5 h-5 mb-2" />
          <span className="text-[10px] font-semibold uppercase text-center leading-tight">More<br/>Dates</span>
        </button>

      </div>
    </div>
  )
}
