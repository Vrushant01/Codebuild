import React from "react"
import { Users, CalendarClock, CheckCircle, Video } from "lucide-react"
import type { DoctorStats } from "../../lib/doctor/doctor-types"

export function DashboardStats({ stats }: { stats: DoctorStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Today's Appointments</p>
        </div>
        <div className="text-3xl font-heading font-bold">{stats.todayAppointments}</div>
      </div>

      <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
        {stats.pendingRequests > 0 && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full pointer-events-none" />
        )}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${stats.pendingRequests > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
            <CalendarClock className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Pending Requests</p>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-heading font-bold">{stats.pendingRequests}</div>
          {stats.pendingRequests > 0 && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Completed Today</p>
        </div>
        <div className="text-3xl font-heading font-bold">{stats.completedToday}</div>
      </div>

      <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-xl">
            <Video className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Telemedicine</p>
        </div>
        <div className="text-3xl font-heading font-bold">{stats.telemedicine}</div>
      </div>

    </div>
  )
}
