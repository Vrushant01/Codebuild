import React from "react"
import { ShieldAlert, Info } from "lucide-react"
import { cn } from "../../lib/utils"

interface MedicalPrivacyNoticeProps {
  className?: string
  isDoctorView?: boolean
}

export function MedicalPrivacyNotice({ className, isDoctorView }: MedicalPrivacyNoticeProps) {
  if (isDoctorView) {
    return (
      <div className={cn("bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3 text-sm text-blue-900 dark:text-blue-200", className)}>
        <ShieldAlert className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
        <div>
          <p className="font-bold">Authorized Clinical Context</p>
          <p className="mt-0.5 font-medium opacity-90">Medical information is shown here only for authorized care contexts. Do not share or expose this screen inappropriately.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-muted/50 border rounded-2xl p-4 flex items-center gap-3 text-sm text-muted-foreground", className)}>
      <Info className="w-5 h-5 shrink-0" />
      <p className="font-medium">Your medical history is completely private and only shared with doctors you authorize.</p>
    </div>
  )
}
