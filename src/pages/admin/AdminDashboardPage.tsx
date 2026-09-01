import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building, Stethoscope, Users, Calendar, AlertCircle } from "lucide-react"
import { adminService } from "../../lib/admin/admin-service"
import type { AdminDashboardStats, AdminActivityLog } from "../../lib/admin/admin-types"
import { AdminMetricCard } from "../../components/admin/AdminMetricCard"
import { AdminActivityFeed } from "../../components/admin/AdminActivityFeed"
import { Button } from "../../components/ui/button"

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [activities, setActivities] = useState<AdminActivityLog[]>([])
  const [pendingOrgs, setPendingOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [statsData, activitiesData, allOrgs] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getActivity(),
        adminService.getOrganizations()
      ])
      
      setStats(statsData)
      setActivities(activitiesData.slice(0, 5))
      setPendingOrgs(allOrgs.filter(o => o.status === "PENDING").slice(0, 3))
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-3xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-muted rounded-3xl" />
          <div className="h-96 bg-muted rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor healthcare platform operations and entities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard 
          label="Organizations" 
          value={stats.organizations} 
          icon={Building}
          indicator={stats.pendingApproval > 0 ? `${stats.pendingApproval} pending` : undefined}
          indicatorColor={stats.pendingApproval > 0 ? "amber" : "muted"}
          onClick={() => navigate("/admin/organizations")}
        />
        <AdminMetricCard 
          label="Doctors" 
          value={stats.doctors} 
          icon={Stethoscope}
          onClick={() => navigate("/admin/doctors")}
        />
        <AdminMetricCard 
          label="Patients" 
          value={stats.patients} 
          icon={Users}
          onClick={() => navigate("/admin/patients")}
        />
        <AdminMetricCard 
          label="Appointments" 
          value={stats.appointments} 
          icon={Calendar}
          onClick={() => navigate("/admin/appointments")}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Review
            </h2>
            <button onClick={() => navigate("/admin/organizations")} className="text-sm font-semibold text-primary hover:underline">
              View all
            </button>
          </div>

          {pendingOrgs.length === 0 ? (
            <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold">All caught up</h3>
              <p className="text-muted-foreground mt-1 text-sm">No organizations are waiting for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrgs.map(org => (
                <div key={org.id} className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{org.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <span>{org.type}</span>
                      <span>•</span>
                      <span>{org.city}</span>
                      <span>•</span>
                      <span>ID: {org.organizationId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md">
                      Pending
                    </span>
                    <Button onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <AdminActivityFeed activities={activities} />
        </div>
      </div>

    </div>
  )
}

// Temporary CheckCircle icon for the empty state
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)
