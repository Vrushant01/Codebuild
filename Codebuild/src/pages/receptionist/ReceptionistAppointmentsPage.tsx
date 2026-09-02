import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { receptionistService } from "../../lib/receptionist/receptionist-service"
import { organizationService } from "../../lib/organization/organization-service"
import type { ReceptionistAppointmentView } from "../../lib/receptionist/receptionist-types"
import { CalendarClock, Video, MapPin, Search, ChevronRight, Plus, User, Phone, Calendar, Clock, FileText } from "lucide-react"
import { Button } from "../../components/ui/button"

export default function ReceptionistAppointmentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterParam = searchParams.get("filter") || "ALL"
  
  const [appointments, setAppointments] = useState<ReceptionistAppointmentView[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(filterParam)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<{ msg: string; ok?: boolean } | null>(null)

  // Walk-in modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookForm, setBookForm] = useState({
    patientName: "",
    patientPhone: "",
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00 AM",
    type: "Physical" as "Physical" | "Online",
    notes: ""
  })

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    const [all, docs] = await Promise.all([
      receptionistService.getAppointments(),
      organizationService.getDoctors()
    ])
    setAppointments(all)
    setDoctors(docs)
    if (docs.length > 0 && !bookForm.doctorId) {
      setBookForm(prev => ({ ...prev, doctorId: docs[0].id }))
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookForm.patientName || !bookForm.doctorId || !bookForm.date || !bookForm.startTime) {
      showToast("Please fill in patient name, doctor, date and time", false)
      return
    }

    setIsBooking(true)
    try {
      await receptionistService.createWalkInAppointment(bookForm)
      showToast("Appointment booked successfully!")
      setIsBookModalOpen(false)
      setBookForm({
        patientName: "",
        patientPhone: "",
        doctorId: doctors[0]?.id || "",
        date: new Date().toISOString().split("T")[0],
        startTime: "10:00 AM",
        type: "Physical",
        notes: ""
      })
      loadData()
    } catch (err: any) {
      showToast(err.message || "Error creating appointment", false)
    } finally {
      setIsBooking(false)
    }
  }

  const filteredApts = appointments.filter(a => {
    const matchesSearch = 
      (a.patientName || "").toLowerCase().includes(search.toLowerCase()) || 
      (a.doctor?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.patientIdentifier || "").toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    const today = new Date().toISOString().split("T")[0]
    if (filter === "TODAY") return a.date === today
    if (filter === "UPCOMING") return a.date >= today && a.status !== "COMPLETED" && !(a.status || "").includes("CANCELLED")
    if (filter === "PENDING") return a.status === "PENDING"
    if (filter === "COMPLETED") return a.status === "COMPLETED"
    
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in space-y-6">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2 ${
          toast.ok !== false ? "bg-emerald-600 text-white" : "bg-foreground text-background"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Front Desk Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage patient check-ins, approvals, schedules, and walk-ins.</p>
        </div>
        <Button 
          onClick={() => setIsBookModalOpen(true)}
          className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors w-full md:w-auto flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <p className="text-muted-foreground mt-1">Try adjusting your search or click "Book Appointment" to add a patient.</p>
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
                      {(apt.timeStr || "10:00 AM").split(" ")[0]}<br/><span className="text-[10px] uppercase opacity-70">{(apt.timeStr || "").split(" ")[1]}</span>
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
                  <p className="text-sm font-medium">{apt.doctor?.name}</p>
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
                    apt.status === "CONFIRMED" || apt.status === "ACCEPTED" ? "bg-blue-100 text-blue-700" :
                    apt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {apt.status}
                  </span>
                  {apt.checkInStatus && (apt.status === "CONFIRMED" || apt.status === "ACCEPTED") && (
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

      {/* Walk-in Booking Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border rounded-[2rem] p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Book Appointment</h3>
                  <p className="text-xs text-muted-foreground">Register front desk patient consultation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={bookForm.patientName}
                  onChange={e => setBookForm({ ...bookForm, patientName: e.target.value })}
                  className="w-full bg-background border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={bookForm.patientPhone}
                    onChange={e => setBookForm({ ...bookForm, patientPhone: e.target.value })}
                    className="w-full bg-background border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                    Consultation Mode
                  </label>
                  <select
                    value={bookForm.type}
                    onChange={e => setBookForm({ ...bookForm, type: e.target.value as any })}
                    className="w-full bg-background border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="Physical">In-Person Visit</option>
                    <option value="Online">Online Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                  Assign Doctor *
                </label>
                <select
                  required
                  value={bookForm.doctorId}
                  onChange={e => setBookForm({ ...bookForm, doctorId: e.target.value })}
                  className="w-full bg-background border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookForm.date}
                    onChange={e => setBookForm({ ...bookForm, date: e.target.value })}
                    className="w-full bg-background border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Time Slot *
                  </label>
                  <select
                    value={bookForm.startTime}
                    onChange={e => setBookForm({ ...bookForm, startTime: e.target.value })}
                    className="w-full bg-background border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "06:00 PM"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Chief Symptoms / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild fever, headache"
                  value={bookForm.notes}
                  onChange={e => setBookForm({ ...bookForm, notes: e.target.value })}
                  className="w-full bg-background border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isBooking}
                  className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow-md"
                >
                  {isBooking ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
