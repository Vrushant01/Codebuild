import React from "react"
import { CheckCircle2 } from "lucide-react"

export function VerifiedReviewBadge() {
  return (
    <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 cursor-help">
      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
      <span className="text-xs font-bold uppercase tracking-wider">Verified appointment</span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center pointer-events-none">
        This review is linked to a completed appointment and confirmed attendance.
      </div>
    </div>
  )
}
