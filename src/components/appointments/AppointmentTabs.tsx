import React from "react"
import { cn } from "../../lib/utils"

export type AppointmentTab = "Upcoming" | "Pending" | "Completed" | "Cancelled"

interface AppointmentTabsProps {
  activeTab: AppointmentTab
  onTabChange: (tab: AppointmentTab) => void
  counts: Record<AppointmentTab, number>
}

export function AppointmentTabs({ activeTab, onTabChange, counts }: AppointmentTabsProps) {
  const tabs: AppointmentTab[] = ["Upcoming", "Pending", "Completed", "Cancelled"]

  return (
    <div className="flex overflow-x-auto scrollbar-hide border-b -mx-4 px-4 sm:mx-0 sm:px-0">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "relative pb-4 pt-2 px-4 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:bg-muted/50 rounded-t-lg",
            activeTab === tab 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab}
          {counts[tab] > 0 && (
            <span className={cn(
              "ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold",
              activeTab === tab 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              {counts[tab]}
            </span>
          )}
          
          {/* Active Indicator */}
          {activeTab === tab && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  )
}
