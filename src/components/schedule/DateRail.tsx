import React, { useRef, useEffect } from "react"
import { cn } from "../../lib/utils"

interface DateRailProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (date: string) => void
}

export function DateRail({ selectedDate, onSelectDate }: DateRailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Generate [Today - 3 days ... Today ... Today + 14 days]
  const dates = []
  const today = new Date()
  
  for (let i = -3; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d)
  }

  // Scroll to selected date on mount
  useEffect(() => {
    if (containerRef.current) {
      const selectedEl = containerRef.current.querySelector('[data-selected="true"]')
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, []) // run once on mount

  const isTodayDate = (dateObj: Date) => {
    return dateObj.toDateString() === today.toDateString()
  }

  return (
    <div className="relative border-b pb-2 sm:pb-4 mb-6">
      <div 
        ref={containerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x px-4 -mx-4 sm:px-0 sm:mx-0"
      >
        {dates.map((dateObj, i) => {
          const dateStr = dateObj.toISOString().split("T")[0]
          const isSelected = selectedDate === dateStr
          const isToday = isTodayDate(dateObj)
          
          const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
          const dayNum = dateObj.getDate()

          return (
            <button
              key={dateStr}
              data-selected={isSelected}
              onClick={() => {
                onSelectDate(dateStr)
                // Optionally scroll into view smoothly
                const el = document.getElementById(`date-${dateStr}`)
                el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
              }}
              id={`date-${dateStr}`}
              className={cn(
                "snap-center shrink-0 w-16 sm:w-[4.5rem] flex flex-col items-center py-3 sm:py-4 rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border-2",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-md -translate-y-1"
                  : isToday 
                    ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                    : "border-transparent bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold tracking-wider mb-1", 
                isSelected ? "text-primary-foreground/80" : isToday ? "text-primary/70" : "text-muted-foreground"
              )}>
                {isToday ? "TODAY" : dayName}
              </span>
              <span className="text-xl sm:text-2xl font-heading font-bold leading-none">
                {dayNum}
              </span>
              
              {/* Active Dot */}
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mt-2 transition-opacity",
                isSelected ? "bg-white opacity-100" : "opacity-0"
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
