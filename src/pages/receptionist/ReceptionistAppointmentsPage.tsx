import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { receptionistService } from "../../lib/receptionist/receptionist-service"
import type { ReceptionistAppointmentView } from "../../lib/receptionist/receptionist-types"
import { PermissionGate } from "../../components/receptionist/PermissionGate"
import { CalendarClock, Video, MapPin, Search, ChevronRight } from "lucide-react"

export default function ReceptionistAppointmentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterParam = searchParams.get("filter") || "ALL"
  
  const [appointments, setAppointments] = useState<ReceptionistAppointmentView[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(filterParam)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const all = await receptionistService.getAppointments()
      setAppointments(all)
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredApts = appointments.filter(a => {
    const matchesSearch = 
      a.patientName.toLowerCase().includes(search.toLowerCase()) || 
      a.doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      a.patientIdentifier.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    const today = new Date().toISOString().split("T")[0]
    if (filter === "TODAY") return a.date === today
    if (filter === "UPCOMING") return a.date > today && a.status !== "COMPLETED" && a.status !== "CANCELLED"
    if (filter === "PENDING") return a.status === "PENDING"
    if (filter === "COMPLETED") return a.status === "COMPLETED"
    
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Front Desk Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage check-ins, approvals, and schedules.</p>
        </div>
        <PermissionGate permission="canCreateAppointments">
          <button className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors w-full md:w-auto">
            Book Appointment
          </button>
        </PermissionGate>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        <div className="bg-card border rounded-3xl p-2 pl-4 flex items-center shadow-sm w-full md:max-w-md focus-within:ring-2 ring-primary transition-all">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, doctor, or ID..."
            className="w-full bg-transparent border-none focus:outline-none px-3 py-2"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide shrink-0">
          {["ALL", "TODAY", "PENDING", "UPCOMING", "COMPLETED"].map(f => (
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
            <div 
              key={apt.appointmentId} 
              onClick={() => navigate(`/app/receptionist/appointments/${apt.appointmentId}`)}
              className="bg-card border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center cursor-pointer hover:border-primary/50 transition-colors group"
            >
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                
                <div className="flex gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="font-bold text-sm text-center leading-tight">
                      {apt.timeStr.split(" ")[0]}<br/><span className="text-[10px] uppercase opacity-70">{apt.timeStr.split(" ")[1]}</span>
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold">{apt.patientName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {apt.patientIdentifier}</p>
                  </div>
                </div>

                <div className="hidden sm:block w-px bg-border h-10 self-center" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Provider</p>
                  <p className="text-sm font-medium">{apt.doctor.name}</p>
                </div>

                <div className="hidden sm:block w-px bg-border h-10 self-center" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Date</p>
                  <p className="text-sm font-medium">{apt.date}</p>
                </div>

              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md flex items-center gap-1">
                  {apt.type === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {apt.type}
                </span>
                
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    apt.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                    apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                    apt.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {apt.status}
                  </span>
                  {apt.checkInStatus && apt.status === "CONFIRMED" && (
                    <span className={`text-[10px] font-bold ${apt.checkInStatus === "Checked In" ? "text-emerald-500" : "text-primary"}`}>
                      • {apt.checkInStatus}
                    </span>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all hidden sm:block" />
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
