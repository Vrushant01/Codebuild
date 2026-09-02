import React from "react"
import { Users, Stethoscope } from "lucide-react"
import type { OrganizationStats } from "../../lib/organization/organization-types"

export function StaffSummaryCard({ stats }: { stats: OrganizationStats }) {
  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm">
      <h3 className="font-bold flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" /> Staff Overview
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/30 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Stethoscope className="w-4 h-4" />
            <span className="text-sm font-semibold">Doctors</span>
          </div>
          <div className="text-3xl font-heading font-bold">{stats.doctors}</div>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">Receptionists</span>
          </div>
          <div className="text-3xl font-heading font-bold">{stats.receptionists}</div>
        </div>
      </div>
    </div>
  )
}
