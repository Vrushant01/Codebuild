import React from "react"
import { useNavigate } from "react-router-dom"
import type { HistoryTimelineItem } from "../../lib/profile/profile-types"
import { Calendar, Activity, Pill, ChevronRight } from "lucide-react"

interface MedicalHistoryTimelineProps {
  items: HistoryTimelineItem[]
}

export function MedicalHistoryTimeline({ items }: MedicalHistoryTimelineProps) {
  const navigate = useNavigate()

  const handleNavigate = (item: HistoryTimelineItem) => {
    // Navigate based on type
    if (item.type === "Appointment") navigate(`/app/patient/appointments/${item.referenceId}`)
    if (item.type === "Treatment") navigate(`/app/patient/schedule`)
    if (item.type === "Case") {
      // Future feature: case details
      alert(`Viewing case: ${item.title}`)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-3xl border border-dashed">
        <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-semibold">No medical history yet.</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        let Icon = Activity
        let iconColor = "text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
        
        if (item.type === "Appointment") {
          Icon = Calendar
          iconColor = "text-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
        } else if (item.type === "Treatment") {
          Icon = Pill
          iconColor = "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
        }

        return (
          <div key={item.id} className="relative flex gap-4">
            
            {/* Timeline Line & Node */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-background ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-border -my-2 z-0" />}
            </div>

            {/* Content */}
            <div className="pb-6 flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {new Date(item.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              
              <button 
                onClick={() => handleNavigate(item)}
                className="w-full text-left bg-card hover:bg-muted/50 border rounded-2xl p-4 transition-colors group flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{item.title}</h4>
                  {item.subtitle && <p className="text-sm text-muted-foreground truncate mt-0.5">{item.subtitle}</p>}
                  
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-muted rounded-md border">
                      {item.type}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      item.status === "Active" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
            
          </div>
        )
      })}
    </div>
  )
}
