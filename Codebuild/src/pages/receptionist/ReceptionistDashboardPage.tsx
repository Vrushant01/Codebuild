import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { receptionistService } from "../../lib/receptionist/receptionist-service"
import { organizationService } from "../../lib/organization/organization-service"
import type { ReceptionistAppointmentView } from "../../lib/receptionist/receptionist-types"
import { PermissionGate } from "../../components/receptionist/PermissionGate"
import { RejectConfirmModal } from "../../components/doctor/RejectConfirmModal"
import {
  CalendarClock, CheckCircle, XCircle, AlertCircle,
  Clock, Video, MapPin, Search, UserCheck, X, Plus, Calendar, User, Phone, FileText
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

export default function ReceptionistDashboardPage() {
  const navigate = useNavigate()

  const [allApts, setAllApts] = useState<ReceptionistAppointmentView[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [rejectTarget, setRejectTarget] = useState<ReceptionistAppointmentView | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok?: boolean } | null>(null)

  // Walk-in booking modal state
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
    const [apts, docs] = await Promise.all([
      receptionistService.getAppointments(),
      organizationService.getDoctors()
    ])
    setAllApts(apts)
    setDoctors(docs)
    if (docs.length > 0 && !bookForm.doctorId) {
      setBookForm(prev => ({ ...prev, doctorId: docs[0].id }))
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const todayStr = new Date().toISOString().split("T")[0]
  const todayApts = allApts
    .filter(a => a.date === todayStr && a.status !== "PENDING")
    .sort((a, b) => (a.timeStr || "").localeCompare(b.timeStr || ""))
  const pendingApts = allApts.filter(a => a.status === "PENDING").slice(0, 5)

  const searchFiltered = todayApts.filter(a =>
    !search ||
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    a.patientIdentifier.toLowerCase().includes(search.toLowerCase()) ||
    (a.doctor?.name || "").toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    todayAppointments: todayApts.length,
    pendingRequests: allApts.filter(a => a.status === "PENDING").length,
    confirmed: todayApts.filter(a => a.status === "CONFIRMED" || a.status === "ACCEPTED").length,
    cancelled: allApts.filter(a => (a.status || "").includes("CANCELLED")).length,
    checkedIn: todayApts.filter(a => a.checkInStatus === "Checked In" || a.status === "COMPLETED").length,
  }

  const handleAccept = async (id: string) => {
    try {
      await receptionistService.acceptAppointment(id)
      showToast("Appointment confirmed.")
      loadData()
    } catch {
      showToast("Failed to accept appointment", false)
    }
  }

  const handleReject = async (reason?: string) => {
    if (!rejectTarget) return
    try {
      await receptionistService.rejectAppointment(rejectTarget.appointmentId, reason)
      setRejectTarget(null)
      showToast("Appointment request rejected.", false)
      loadData()
    } catch {
      showToast("Failed to reject appointment", false)
    }
  }

  const handleCheckIn = async (id: string) => {
    try {
      await receptionistService.checkInPatient(id)
      showToast("Patient checked in successfully.")
      loadData()
    } catch {
      showToast("Failed to check in patient", false)
    }
  }

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookForm.patientName || !bookForm.doctorId || !bookForm.date || !bookForm.startTime) {
      showToast("Please fill in patient name, doctor, date and time", false)
      return
    }

    setIsBooking(true)
    try {
      await receptionistService.createWalkInAppointment(bookForm)
      showToast("Walk-in appointment booked successfully!")
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-3xl" />)}
        </div>
        <div className="h-80 bg-muted rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2",
          toast.ok !== false ? "bg-emerald-600 text-white" : "bg-foreground text-background"
        )}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Good day, <span className="text-primary">Front Desk</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage today's appointments and patient arrivals in real time.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient, doctor, ID…"
              className="w-full bg-card border rounded-2xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            onClick={() => setIsBookModalOpen(true)}
            className="bg-primary text-primary-foreground font-bold rounded-2xl px-4 py-2.5 flex items-center gap-1.5 shadow-md shadow-primary/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> Book Walk-in
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate("/app/receptionist/appointments?filter=TODAY")} className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm font-semibold"><CalendarClock className="w-4 h-4" /> Today's Total</div>
          <div className="text-4xl font-heading font-bold">{stats.todayAppointments}</div>
          <p className="text-xs text-muted-foreground mt-1">appointments</p>
        </button>

        <button onClick={() => navigate("/app/receptionist/appointments?filter=PENDING")} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3 text-sm font-semibold"><AlertCircle className="w-4 h-4" /> Pending</div>
          <div className="text-4xl font-heading font-bold text-amber-700 dark:text-amber-400">{stats.pendingRequests}</div>
          <p className="text-xs text-muted-foreground mt-1">requests</p>
        </button>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3 text-sm font-semibold"><UserCheck className="w-4 h-4" /> Checked In</div>
          <div className="text-4xl font-heading font-bold text-emerald-700 dark:text-emerald-400">{stats.checkedIn}</div>
          <p className="text-xs text-muted-foreground mt-1">today</p>
        </div>

        <div className="bg-destructive/5 border border-destructive/10 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-destructive mb-3 text-sm font-semibold"><XCircle className="w-4 h-4" /> Cancelled</div>
          <div className="text-4xl font-heading font-bold text-destructive">{stats.cancelled}</div>
          <p className="text-xs text-muted-foreground mt-1">all-time</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Today's Operations List */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Today's Operations ({searchFiltered.length})
            </h2>
            <button onClick={() => navigate("/app/receptionist/schedule")} className="text-sm font-semibold text-primary hover:underline">
              View Schedule
            </button>
          </div>

          {searchFiltered.length === 0 ? (
            <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
              <CalendarClock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold">No appointments for today</h3>
              <p className="text-muted-foreground mt-1 text-sm">Use the "Book Walk-in" button to register patient arrivals.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchFiltered.map(apt => {
                const isCheckedIn = apt.checkInStatus === "Checked In" || apt.status === "COMPLETED"
                return (
                  <div 
                    key={apt.appointmentId} 
                    className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => navigate(`/app/receptionist/appointments/${apt.appointmentId}`)}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-base">{apt.timeStr}</span>
                        {isCheckedIn ? (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                            Checked In
                          </span>
                        ) : (
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full",
                            apt.status === "CONFIRMED" || apt.status === "ACCEPTED" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-muted text-muted-foreground"
                          )}>
                            {apt.status}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm">{apt.patientName} <span className="text-muted-foreground font-normal text-xs">({apt.patientIdentifier})</span></div>
                      <div className="text-xs text-muted-foreground mt-0.5">Dr. {apt.doctor?.name} • {apt.doctor?.specialization}</div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg",
                        apt.type === "Online"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      )}>
                        {apt.type === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {apt.type}
                      </span>

                      {!isCheckedIn && (apt.status === "CONFIRMED" || apt.status === "ACCEPTED") && (
                        <button
                          onClick={e => { e.stopPropagation(); handleCheckIn(apt.appointmentId) }}
                          className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending Requests Column */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Requests ({pendingApts.length})
            </h2>
            <button onClick={() => navigate("/app/receptionist/appointments?filter=PENDING")} className="text-sm font-semibold text-primary hover:underline">
              View All
            </button>
          </div>

          {pendingApts.length === 0 ? (
            <div className="bg-card border border-dashed rounded-3xl p-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
              <p className="font-semibold text-sm">No pending requests</p>
              <p className="text-xs text-muted-foreground mt-1">All booking requests are processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApts.map(apt => (
                <div key={apt.appointmentId} className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground">{apt.date} • {apt.timeStr}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">Dr. {apt.doctor?.name}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <button
                      onClick={() => handleAccept(apt.appointmentId)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => setRejectTarget(apt)}
                      className="flex-1 bg-muted hover:bg-destructive/10 hover:text-destructive font-bold py-1.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectConfirmModal
          isOpen={!!rejectTarget}
          patientName={rejectTarget.patientName}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
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
                  <h3 className="font-bold text-lg leading-tight">Book Walk-in Patient</h3>
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
                  placeholder="e.g. Mild chest pain, fever since 2 days"
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
