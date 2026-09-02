import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { doctorService } from "../../lib/doctor/doctor-service"
import { billingService } from "../../lib/billing/billing-service"
import type { DoctorBillingSummary } from "../../lib/billing/billing-types"
import { RejectConfirmModal } from "../../components/doctor/RejectConfirmModal"
import type { DoctorStats, DoctorAppointment } from "../../lib/doctor/doctor-types"
import { 
  CalendarClock, CalendarDays, CheckCircle2, Video,
  Clock, ChevronRight, AlertCircle, Users, MapPin,
  ArrowRight, Stethoscope, Sparkles, Receipt
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function formatRelativeTime(isoStr: string): string {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 60000
  if (diff < 1) return "just now"
  if (diff < 60) return `${Math.floor(diff)} min ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

export default function DoctorDashboardPage() {
  const navigate = useNavigate()

  const [stats, setStats]     = useState<DoctorStats | null>(null)
  const [pending, setPending] = useState<DoctorAppointment[]>([])
  const [todayApts, setTodayApts] = useState<DoctorAppointment[]>([])
  const [doctorBilling, setDoctorBilling] = useState<DoctorBillingSummary | null>(null)
  const [loading, setLoading] = useState(true)

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<DoctorAppointment | null>(null)
  const [rejecting, setRejecting]       = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    const [s, all, bill] = await Promise.all([
      doctorService.getDashboardStats(), 
      doctorService.getAppointments(),
      billingService.getDoctorBillingSummary()
    ])
    setStats(s)
    setDoctorBilling(bill)
    const todayStr = new Date().toISOString().split("T")[0]
    setPending(all.filter(a => a.status === "PENDING").slice(0, 3))
    setTodayApts(all.filter(a => a.date === todayStr && a.status !== "PENDING").sort((a, b) => a.timeStr.localeCompare(b.timeStr)))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleAccept = async (id: string) => {
    await doctorService.updateAppointmentStatus(id, "CONFIRMED")
    showToast("Appointment confirmed.")
    loadData()
  }

  const handleRejectConfirm = async (reason?: string) => {
    if (!rejectTarget) return
    setRejecting(true)
    await doctorService.updateAppointmentStatus(rejectTarget.id, "REJECTED")
    setRejectTarget(null)
    setRejecting(false)
    showToast("Appointment request rejected.", "error")
    loadData()
  }

  if (loading || !stats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
        <div className="h-10 w-72 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-3xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-72 bg-muted rounded-3xl" />
          <div className="h-72 bg-muted rounded-3xl" />
        </div>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split("T")[0]
  const nowHour  = new Date().getHours()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2 duration-300",
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-destructive text-destructive-foreground"
        )}>
          {toast.msg}
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            {getGreeting()}, <span className="text-primary">Dr. Aarav</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what needs your attention today.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/app/doctor/appointments")} className="gap-2">
          <CalendarDays className="w-4 h-4" /> All appointments
        </Button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <button
          onClick={() => navigate("/app/doctor/appointments")}
          className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm font-semibold">
            <CalendarDays className="w-4 h-4" /> Today
          </div>
          <div className="text-4xl font-heading font-bold text-foreground">{stats.todayAppointments}</div>
          <p className="text-xs text-muted-foreground mt-1">appointments</p>
        </button>

        {/* Pending */}
        <button
          onClick={() => navigate("/app/doctor/appointments?tab=Pending")}
          className={cn(
            "rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left border",
            stats.pendingRequests > 0
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
              : "bg-card"
          )}
        >
          <div className={cn(
            "flex items-center gap-2 mb-3 text-sm font-semibold",
            stats.pendingRequests > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          )}>
            <AlertCircle className="w-4 h-4" /> Pending
          </div>
          <div className={cn(
            "text-4xl font-heading font-bold",
            stats.pendingRequests > 0 ? "text-amber-700 dark:text-amber-400" : "text-foreground"
          )}>{stats.pendingRequests}</div>
          <p className="text-xs text-muted-foreground mt-1">requests</p>
        </button>

        {/* Upcoming */}
        <button
          onClick={() => navigate("/app/doctor/appointments?tab=Upcoming")}
          className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm font-semibold">
            <CalendarClock className="w-4 h-4" /> Upcoming
          </div>
          <div className="text-4xl font-heading font-bold text-foreground">{stats.upcomingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">confirmed</p>
        </button>

        {/* Completed */}
        <button
          onClick={() => navigate("/app/doctor/appointments?tab=Completed")}
          className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
          </div>
          <div className="text-4xl font-heading font-bold text-emerald-600 dark:text-emerald-400">{stats.completedToday}</div>
          <p className="text-xs text-muted-foreground mt-1">today</p>
        </button>
      </div>

      {/* ── MEDIREACH Platform Attended Patients & Platform Fee ── */}
      {doctorBilling && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">MEDIREACH Platform Activity</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2.5 py-0.5 rounded-full">
                  Pay-per-Patient Lead
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have attended <strong>{doctorBilling.attendedPatientsCount} patients</strong> acquired through MEDIREACH (Platform fee rate: ₹{doctorBilling.ratePerPatient}/pt).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-card/80 backdrop-blur-sm border rounded-2xl px-5 py-3 self-stretch sm:self-auto justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Your Attended Patients</p>
              <p className="text-xl font-bold font-heading text-foreground">{doctorBilling.attendedPatientsCount} Patients</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hospital Fee Contribution</p>
              <p className="text-xl font-bold font-heading text-primary">₹{doctorBilling.platformFeeGenerated.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── Pending Requests (priority) ─────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Requests
              {stats.pendingRequests > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{stats.pendingRequests}</span>
              )}
            </h2>
            {stats.pendingRequests > 3 && (
              <button onClick={() => navigate("/app/doctor/appointments?tab=Pending")} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="bg-card border border-dashed rounded-3xl p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No pending requests</p>
              <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(apt => (
                <div key={apt.id} className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/40 rounded-3xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {apt.patientProfile.avatarInitials}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{apt.patientProfile.name}</p>
                        <p className="text-xs text-muted-foreground">{apt.patientProfile.patientId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full shrink-0">
                      Pending
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground pl-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.timeStr}</span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1">
                      {apt.consultationType === "Online" ? <Video className="w-3 h-3 text-blue-500" /> : <MapPin className="w-3 h-3 text-emerald-500" />}
                      {apt.consultationType}
                    </span>
                    <span className="text-border">·</span>
                    <span>{formatRelativeTime(apt.createdAt)}</span>
                  </div>

                  {apt.currentCase && (
                    <p className="text-xs bg-muted/50 px-3 py-2 rounded-xl text-foreground border border-dashed">
                      <span className="font-semibold">Case: </span>{apt.currentCase.title}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectTarget(apt)}
                      className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5 text-xs"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(apt.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Today's Schedule ────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" /> Today's Schedule
            </h2>
            <button onClick={() => navigate("/app/doctor/appointments")} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayApts.length === 0 ? (
            <div className="bg-card border border-dashed rounded-3xl p-10 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground">Schedule is clear</p>
              <p className="text-sm text-muted-foreground mt-1">No appointments today.</p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-[27px] before:w-px before:bg-border">
              {todayApts.map(apt => {
                const aptHour = parseInt(apt.timeStr.split(":")[0]) + (apt.timeStr.includes("PM") && !apt.timeStr.startsWith("12") ? 12 : 0)
                const isNow   = Math.abs(aptHour - nowHour) === 0

                return (
                  <div key={apt.id} className="relative flex gap-4 items-start group">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-2 z-10 shrink-0 transition-all",
                      apt.status === "COMPLETED" ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" :
                      isNow ? "bg-primary shadow-[0_0_0_4px_rgba(14,165,233,0.2)] animate-pulse" :
                      "bg-muted-foreground/40"
                    )} />

                    <div
                      className={cn(
                        "flex-1 bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer",
                        isNow && apt.status !== "COMPLETED" && "border-primary/30 ring-1 ring-primary/20"
                      )}
                      onClick={() => navigate(`/app/doctor/appointments/${apt.id}`)}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{apt.timeStr}</span>
                          {isNow && apt.status === "CONFIRMED" && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full">NOW</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          apt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          apt.status === "CONFIRMED"  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{apt.patientProfile.name}</p>
                          <p className="text-xs text-muted-foreground">{apt.patientProfile.patientId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg",
                            apt.consultationType === "Online"
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          )}>
                            {apt.consultationType === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {apt.consultationType}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Reject Modal */}
      <RejectConfirmModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        patientName={rejectTarget?.patientProfile.name}
        isLoading={rejecting}
      />

    </div>
  )
}
