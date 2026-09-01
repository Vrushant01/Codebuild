import React from "react"
import { Activity, Calendar, Pill, ShieldAlert } from "lucide-react"
import type { HistoryTimelineItem } from "../../lib/history/medical-history-types"

interface HealthJourneyProps {
  timeline: HistoryTimelineItem[]
  onItemClick?: (item: HistoryTimelineItem) => void
}

export function HealthJourney({ timeline, onItemClick }: HealthJourneyProps) {
  if (timeline.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
        <p>No historical events recorded.</p>
      </div>
    )
  }

  const getIcon = (type: HistoryTimelineItem["type"]) => {
    switch(type) {
      case "Appointment": return <Calendar className="w-5 h-5 text-blue-500" />
      case "Case created": 
      case "Case updated": return <Activity className="w-5 h-5 text-primary" />
      case "Medicine prescribed":
      case "Medicine completed": return <Pill className="w-5 h-5 text-emerald-500" />
      case "Allergy added": return <ShieldAlert className="w-5 h-5 text-red-500" />
      default: return <Activity className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getBg = (type: HistoryTimelineItem["type"]) => {
    switch(type) {
      case "Appointment": return "bg-blue-100 dark:bg-blue-900/30"
      case "Case created": 
      case "Case updated": return "bg-primary/10"
      case "Medicine prescribed":
      case "Medicine completed": return "bg-emerald-100 dark:bg-emerald-900/30"
      case "Allergy added": return "bg-red-100 dark:bg-red-900/30"
      default: return "bg-muted"
    }
  }

  // Group by date
  const grouped = timeline.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, HistoryTimelineItem[]>)

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="relative border-l-2 border-muted/50 ml-4 lg:ml-8 pl-8 lg:pl-12 space-y-12 py-4">
      {sortedDates.map(date => (
        <div key={date} className="relative">
          {/* Date marker */}
          <div className="absolute -left-[38px] lg:-left-[54px] top-0 w-3 h-3 rounded-full border-2 border-primary bg-background ring-4 ring-background" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 -mt-1.5">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
          
          <div className="space-y-4">
            {grouped[date].map(item => (
              <div 
                key={item.id}
                onClick={() => onItemClick && onItemClick(item)}
                className="bg-card border rounded-2xl p-4 sm:p-5 flex gap-4 items-start hover:border-primary/30 transition-colors cursor-pointer group shadow-sm"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBg(item.type)}`}>
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-bold text-base group-hover:text-primary transition-colors">{item.title}</h5>
                    {item.status && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-muted text-muted-foreground">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-1.5">
                    {item.type}
                    {(item.doctorName || item.organizationName) && (
                      <>
                        <span>•</span>
                        {item.doctorName} {item.organizationName && `(${item.organizationName})`}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
