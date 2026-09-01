import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { doctorService } from "../../lib/doctor/doctor-service"
import type { DoctorAppointment } from "../../lib/doctor/doctor-types"
import { PermissionGate } from "../../components/receptionist/PermissionGate"
import { RejectConfirmModal } from "../../components/doctor/RejectConfirmModal"
import {
  CalendarClock, CheckCircle, XCircle, AlertCircle,
  Clock, Video, MapPin, Search, UserCheck, X
} from "lucide-react"
import { cn } from "../../lib/utils"

// Receptionist uses the shared doctor mock data for appointments (single source of truth)

const CHECK_IN_LOCAL: Record<string, string> = {} // appointmentId -> time string

export default function ReceptionistDashboardPage() {
  const navigate = useNavigate()

  const [allApts, setAllApts]       = useState<DoctorAppointment[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [rejectTarget, setRejectTarget] = useState<DoctorAppointment | null>(null)
  const [checkInMap, setCheckInMap] = useState<Record<string, string>>({})
  const [toast, setToast]           = useState<{ msg: string; ok?: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    const data = await doctorService.getAppointments()
    setAllApts(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const todayStr  = new Date().toISOString().split("T")[0]
  const todayApts = allApts
    .filter(a => a.date === todayStr && a.status !== "PENDING")
    .sort((a, b) => a.timeStr.localeCompare(b.timeStr))
  const pendingApts = allApts.filter(a => a.status === "PENDING").slice(0, 3)

  const searchFiltered = todayApts.filter(a =>
    !search ||
    a.patientProfile.name.toLowerCase().includes(search.toLowerCase()) ||
    a.patientProfile.patientId.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    todayAppointments: todayApts.length,
    pendingRequests:   allApts.filter(a => a.status === "PENDING").length,
    confirmed:         todayApts.filter(a => a.status === "CONFIRMED").length,
    cancelled:         todayApts.filter(a => a.status === "CANCELLED").length,
    checkedIn:         Object.keys(checkInMap).length,
  }

  const handleAccept = async (id: string) => {
    await doctorService.updateAppointmentStatus(id, "CONFIRMED")
    showToast("Appointment confirmed.")
    loadData()
  }

  const handleReject = async (reason?: string) => {
    if (!rejectTarget) return
    await doctorService.updateAppointmentStatus(rejectTarget.id, "REJECTED")
    setRejectTarget(null)
    showToast("Appointment request rejected.", false)
    loadData()
  }

  const handleCheckIn = (id: string) => {
    const now  = new Date()
    const time = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`
    setCheckInMap(prev => ({ ...prev, [id]: time }))
    showToast(`Patient checked in at ${time}.`)
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
            Good morning, <span className="text-primary">Front Desk</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage today's appointments and patient arrivals.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or ID…"
            className="w-full bg-card border rounded-2xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate("/app/receptionist/appointments")} className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
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
          <p className="text-xs text-muted-foreground mt-1">today</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Today's Timeline */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Today's Operations
            </h2>
            <button onClick={() => navigate("/app/receptionist/schedule")} className="text-sm font-semibold text-primary hover:underline">
              View Schedule
            </button>
          </div>

          {searchFiltered.length === 0 ? (
            <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
              <CalendarClock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold">No appointments today</h3>
              <p className="text-muted-foreground mt-1 text-sm">Everything is clear for the day.</p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-[27px] before:w-px before:bg-border">
              {searchFiltered.map(apt => {
                const isCheckedIn = !!checkInMap[apt.id]
                const checkTime   = checkInMap[apt.id]
                return (
                  <div key={apt.id} className="relative flex gap-4 items-start group">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-2 z-10 shrink-0",
                      isCheckedIn    ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" :
                      apt.status === "CONFIRMED" ? "bg-primary shadow-[0_0_0_4px_rgba(14,165,233,0.1)]" :
                      "bg-muted-foreground/40"
                    )} />

                    <div className="flex-1 bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/app/receptionist/appointments/${apt.id}`)}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-base">{apt.timeStr}</span>
                            {isCheckedIn ? (
                              <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                Checked in {checkTime}
                              </span>
                            ) : (
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-muted text-muted-foreground"
                              )}>
                                {apt.status === "CONFIRMED" ? "Expected" : apt.status}
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-sm">{apt.patientProfile.name} <span className="text-muted-foreground font-normal text-xs">({apt.patientProfile.patientId})</span></div>
                          <div className="text-xs text-muted-foreground mt-0.5">Dr. {apt.doctor.name}</div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap pl-0 sm:pl-0">
                          <span className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg",
                            apt.consultationType === "Online"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          )}>
                            {apt.consultationType === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {apt.consultationType}
                          </span>

                          {!isCheckedIn && apt.status === "CONFIRMED" && (
                            <PermissionGate permission="canCheckInPatients">
                              <button
                                onClick={e => { e.stopPropagation(); handleCheckIn(apt.id) }}
                                className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                              >
                                Check In
                              </button>
                            </PermissionGate>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending Requests Sidebar */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Requests
              {stats.pendingRequests > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{stats.pendingRequests}</span>
              )}
            </h2>
          </div>

          {pendingApts.length === 0 ? (
            <div className="bg-card border border-dashed rounded-3xl p-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApts.map(apt => (
                <div key={apt.id} className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {apt.patientProfile.avatarInitials}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{apt.patientProfile.name}</h4>
                        <p className="text-xs text-muted-foreground">{apt.patientProfile.patientId}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {apt.date} at {apt.timeStr}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {apt.consultationType === "Online" ? "Online" : "Physical"} · {apt.doctor.name}
                  </p>

                  <div className="flex gap-2">
                    <PermissionGate permission="canApproveAppointments">
                      <button
                        onClick={() => handleAccept(apt.id)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setRejectTarget(apt)}
                        className="flex-1 bg-background hover:bg-muted border border-input text-foreground text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        Reject
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              ))}

              {stats.pendingRequests > 3 && (
                <button onClick={() => navigate("/app/receptionist/appointments?filter=PENDING")} className="w-full text-center text-sm font-semibold text-primary hover:underline">
                  View all {stats.pendingRequests} requests
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      <RejectConfirmModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        patientName={rejectTarget?.patientProfile.name}
      />
    </div>
  )
}
