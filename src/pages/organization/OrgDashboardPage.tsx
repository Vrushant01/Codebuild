import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { organizationService } from "../../lib/organization/organization-service"
import { OrganizationIdentityCard } from "../../components/organization/OrganizationIdentityCard"
import { StaffSummaryCard } from "../../components/organization/StaffSummaryCard"
import { ServiceSummaryCard } from "../../components/organization/ServiceSummaryCard"
import type { OrganizationStats, OrganizationAppointment } from "../../lib/organization/organization-types"
import { CalendarClock, Users, Stethoscope, Activity, ChevronRight, Video, MapPin } from "lucide-react"

export default function OrgDashboardPage() {
  const navigate = useNavigate()
  const [org, setOrg] = useState<any>(null)
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [todayApts, setTodayApts] = useState<OrganizationAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [orgData, statsData, allApts] = await Promise.all([
        organizationService.getOrganization(),
        organizationService.getDashboardStats(),
        organizationService.getAppointments()
      ])
      
      setOrg(orgData)
      setStats(statsData)
      
      const today = new Date().toISOString().split("T")[0]
      setTodayApts(allApts.filter(a => a.date === today).slice(0, 5))
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !org || !stats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-3xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <OrganizationIdentityCard organization={org} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <CalendarClock className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Today's Appointments</p>
            </div>
          </div>
          <div className="text-3xl font-heading font-bold">{stats.todayAppointments}</div>
        </div>

        <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/organization/doctors")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Doctors</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-heading font-bold">{stats.doctors}</div>
        </div>

        <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/organization/receptionists")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Receptionists</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-heading font-bold">{stats.receptionists}</div>
        </div>

        <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/organization/services")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Services</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-heading font-bold">{stats.services}</div>
        </div>
        
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Today's Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" /> Today's Operations
            </h2>
            <button onClick={() => navigate("/app/organization/appointments")} className="text-sm font-semibold text-primary hover:underline">
              View all
            </button>
          </div>
          
          {todayApts.length === 0 ? (
            <div className="bg-card border rounded-3xl p-8 text-center border-dashed">
              <p className="text-muted-foreground">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayApts.map(apt => (
                <div key={apt.id} className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <span className="font-bold text-sm">{apt.timeStr.split(" ")[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold">{apt.patientName}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">with {apt.doctor.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md flex items-center gap-1">
                      {apt.consultationType === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {apt.consultationType}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      apt.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      apt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summaries */}
        <div className="space-y-6">
          <StaffSummaryCard stats={stats} />
          <ServiceSummaryCard stats={stats} />
        </div>

      </div>

    </div>
  )
}
