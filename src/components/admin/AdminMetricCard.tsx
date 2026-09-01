import React from "react"
import type { LucideIcon } from "lucide-react"

interface AdminMetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  indicator?: string
  indicatorColor?: "emerald" | "amber" | "destructive" | "primary" | "muted"
  onClick?: () => void
}

export function AdminMetricCard({ 
  label, 
  value, 
  icon: Icon, 
  indicator,
  indicatorColor = "muted",
  onClick 
}: AdminMetricCardProps) {
  const indicatorClasses = {
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    destructive: "text-destructive bg-destructive/10",
    primary: "text-primary bg-primary/10",
    muted: "text-muted-foreground bg-muted"
  }

  return (
    <div 
      className={`bg-card border rounded-3xl p-5 shadow-sm transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </div>
        {indicator && (
          <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${indicatorClasses[indicatorColor]}`}>
            {indicator}
          </div>
        )}
      </div>
      <div className="text-3xl font-heading font-bold">{value}</div>
    </div>
  )
}
