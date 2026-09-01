import React from "react"
import { cn } from "../../lib/utils"

interface ProgressIndicatorProps {
  current: number
  total: number
  label?: string
  showLabel?: boolean
}

export function ProgressIndicator({ 
  current, 
  total, 
  label,
  showLabel = false 
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {String(current).padStart(2, '0')} {label}
        </span>
      )}
      
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 ease-out",
              i + 1 === current 
                ? "w-8 bg-primary" 
                : i + 1 < current 
                  ? "w-4 bg-primary/40" 
                  : "w-4 bg-muted"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      
      {/* Screen reader only announcement */}
      <span className="sr-only">
        Step {current} of {total}{label ? `: ${label}` : ""}
      </span>
    </div>
  )
}
