import React, { useState, useEffect } from "react"
import { Search, Calendar, ShieldAlert } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true)
      const data = await adminService.getAppointments()
      setAppointments(data)
      setLoading(false)
    }
    loadAppointments()
  }, [])

  const filteredAppointments = appointments.filter(a => {
    const docName = typeof a.doctor === 'object' ? a.doctor?.name || "" : (a.doctor || a.doctorName || "")
    const pName = a.patientName || (typeof a.patientUserId === 'object' ? a.patientUserId?.name : "") || ""
    const aId = (a.id || a._id || "").toString()
    return (
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case "CONFIRMED": return "bg-emerald-100 text-emerald-700"
      case "PENDING": return "bg-amber-100 text-amber-700"
      case "COMPLETED": return "bg-blue-100 text-blue-700"
      case "CANCELLED": return "bg-destructive/10 text-destructive"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Appointments Overview</h1>
        <p className="text-muted-foreground mt-1">Platform operational view. Clinical details are protected.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Privacy Notice:</strong> This view only exposes operational metadata (time, status, organization). Clinical notes, prescriptions, and diagnoses are strictly hidden.
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-4 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search appointments by patient, doctor or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No appointments found</h3>
        </div>
      ) : (
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAppointments.map((apt) => {
                  const docLabel = typeof apt.doctor === 'object' ? apt.doctor?.name : (apt.doctor || apt.doctorName || "Doctor")
                  const patientLabel = apt.patientName || (typeof apt.patientUserId === 'object' ? apt.patientUserId?.name : "Patient")
                  const aptId = (apt.id || apt._id || "").toString()

                  return (
                    <tr key={aptId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{aptId.substring(0, 10)}...</td>
                      <td className="px-6 py-4 font-medium">{patientLabel}</td>
                      <td className="px-6 py-4 text-muted-foreground">{docLabel}</td>
                      <td className="px-6 py-4">
                        {apt.date} <span className="text-muted-foreground ml-1">{apt.timeStr || apt.time || ""}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
