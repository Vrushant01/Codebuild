import React from "react"
import { Activity, Pill, ShieldAlert, CalendarClock } from "lucide-react"

interface MedicalSummaryCardProps {
  activeCasesCount: number
  activeMedicinesCount: number
  allergiesCount: number
}

export function MedicalSummaryCard({ activeCasesCount, activeMedicinesCount, allergiesCount }: MedicalSummaryCardProps) {
  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-6">Your Health Information</h3>
      
      <div className="grid grid-cols-3 gap-3">
        
        <div className="bg-muted/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold font-heading">{activeCasesCount}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Active Cases</span>
        </div>

        <div className="bg-muted/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <Pill className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold font-heading">{activeMedicinesCount}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Medicines</span>
        </div>

        <div className="bg-muted/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold font-heading">{allergiesCount}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Allergies</span>
        </div>

      </div>

      <div className="mt-6 pt-5 border-t flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">No upcoming appointments</p>
          <p className="text-xs text-muted-foreground">Your schedule is clear.</p>
        </div>
      </div>
    </div>
  )
}
