import React from "react"
import { Activity } from "lucide-react"
import type { OrganizationStats } from "../../lib/organization/organization-types"

export function ServiceSummaryCard({ stats }: { stats: OrganizationStats }) {
  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm">
      <h3 className="font-bold flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" /> Services Overview
      </h3>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 block mb-1">Active Services</span>
          <div className="text-3xl font-heading font-bold text-blue-700 dark:text-blue-300">{stats.services}</div>
        </div>
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Activity className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
