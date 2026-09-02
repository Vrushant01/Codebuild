import React from "react"
import { cn } from "../../lib/utils"
import type { TimeSlot } from "../../lib/booking/appointment-types"
import { Clock, Lock } from "lucide-react"

interface TimeSlotGridProps {
  slots: TimeSlot[]
  selectedSlot: string | null
  onSlotSelect: (timeStr: string) => void
  isLoading: boolean
}

export function TimeSlotGrid({ slots, selectedSlot, onSlotSelect, isLoading }: TimeSlotGridProps) {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-11 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-2xl bg-muted/20">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h4 className="font-semibold text-foreground">No slots available</h4>
        <p className="text-sm text-muted-foreground mt-1">Please try selecting another date.</p>
      </div>
    )
  }

  // Group slots by period
  const morning = slots.filter(s => s.timeStr.includes("AM"))
  const afternoon = slots.filter(s => s.timeStr.includes("PM"))

  const renderGroup = (title: string, groupSlots: TimeSlot[]) => {
    if (groupSlots.length === 0) return null

    return (
      <div className="mb-6 last:mb-0">
        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{title}</h5>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {groupSlots.map(slot => {
            const isAvailable = slot.status === "AVAILABLE"
            const isSelected = selectedSlot === slot.timeStr

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSlotSelect(slot.timeStr)}
                title={!isAvailable ? "This time slot is already booked" : `Select ${slot.timeStr}`}
                className={cn(
                  "relative py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 outline-none border-2 flex items-center justify-center gap-1",
                  !isAvailable 
                    ? "bg-muted/80 border-border/40 text-muted-foreground/40 cursor-not-allowed opacity-60 line-through select-none"
                    : isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                      : "bg-card border-border hover:border-primary/50 hover:bg-accent/50 text-foreground active:scale-95"
                )}
              >
                {!isAvailable && <Lock className="w-3 h-3 text-muted-foreground/60 mr-1" />}
                <span>{slot.timeStr.split(" ")[0]}</span>
                {!isAvailable && (
                  <span className="sr-only">(Booked)</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderGroup("Morning", morning)}
      {renderGroup("Afternoon & Evening", afternoon)}
    </div>
  )
}
