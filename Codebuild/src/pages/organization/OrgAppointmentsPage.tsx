import React, { useState, useEffect } from "react"
import { organizationService } from "../../lib/organization/organization-service"
import type { OrganizationAppointment } from "../../lib/organization/organization-types"
import { CalendarClock, Filter, Video, MapPin, Search } from "lucide-react"

export default function OrgAppointmentsPage() {
  const [appointments, setAppointments] = useState<OrganizationAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL") // ALL, TODAY, UPCOMING, COMPLETED
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const all = await organizationService.getAppointments()
      setAppointments(all)
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredApts = appointments.filter(a => {
    const pName = (a.patientName || "").toLowerCase()
    const dName = (a.doctor?.name || "").toLowerCase()
    const pId = (typeof a.patientId === 'object' ? (a.patientId as any)?.patientId || '' : a.patientId || '').toLowerCase()
    const q = search.toLowerCase().trim()

    const matchesSearch = !q || pName.includes(q) || dName.includes(q) || pId.includes(q)
    if (!matchesSearch) return false

    const today = new Date().toISOString().split("T")[0]
    if (filter === "TODAY") return a.date === today
    if (filter === "UPCOMING") return a.date >= today && a.status !== "COMPLETED" && a.status !== "CANCELLED"
    if (filter === "COMPLETED") return a.status === "COMPLETED"
    
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Facility Appointments</h1>
        <p className="text-muted-foreground mt-1">Manage all appointments across your organization.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        <div className="bg-card border rounded-3xl p-2 pl-4 flex items-center shadow-sm w-full md:max-w-md focus-within:ring-2 ring-primary transition-all">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, doctor, or ID..."
            className="w-full bg-transparent border-none focus:outline-none px-3 py-2 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide shrink-0">
          {["ALL", "TODAY", "UPCOMING", "COMPLETED"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-3xl" />)}
        </div>
      ) : filteredApts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <CalendarClock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No appointments found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApts.map(apt => (
            <div key={apt.id} className="bg-card border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:shadow-md transition-shadow">
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                
                <div className="flex gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="font-bold text-sm text-center leading-tight">
                      {apt.date && apt.date.includes("-") ? apt.date.split("-")[2] : "01"}<br/><span className="text-[10px] uppercase opacity-70">Day</span>
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold">{apt.patientName || "Patient"}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ID: {typeof apt.patientId === 'object' ? (apt.patientId as any)?.patientId : String(apt.patientId || "PAT-01")}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block w-px bg-border h-10 self-center" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Provider</p>
                  <p className="text-sm font-medium text-foreground">{apt.doctor?.name || "Doctor"}</p>
                </div>

                <div className="hidden sm:block w-px bg-border h-10 self-center" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Schedule</p>
                  <p className="text-sm font-medium">{apt.timeStr || (apt as any).startTime || "Scheduled"}</p>
                </div>

              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md flex items-center gap-1">
                  {apt.consultationType === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {apt.consultationType || "Physical"}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  apt.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                  apt.status === "CONFIRMED" || apt.status === "ACCEPTED" ? "bg-blue-100 text-blue-700" :
                  apt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                  apt.status === "CANCELLED" ? "bg-rose-100 text-rose-700" :
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
  )
}
