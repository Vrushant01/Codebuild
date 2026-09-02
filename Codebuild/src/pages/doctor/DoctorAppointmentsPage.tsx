import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { doctorService } from "../../lib/doctor/doctor-service"
import { RejectConfirmModal } from "../../components/doctor/RejectConfirmModal"
import { EarlyMeetingAlertModal } from "../../components/telemedicine/EarlyMeetingAlertModal"
import { checkMeetingTimeStatus } from "../../lib/booking/meeting-time-utils"
import type { DoctorAppointment } from "../../lib/doctor/doctor-types"
import {
  CalendarClock, Search, Video, MapPin, Clock,
  ChevronRight, CheckCircle2, XCircle, AlertCircle, X, PhoneCall
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"

type Tab = "Today" | "Pending" | "Upcoming" | "Completed" | "Cancelled"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-muted text-muted-foreground",
    REJECTED:  "bg-destructive/10 text-destructive",
    ACCEPTED:  "bg-blue-100 text-blue-700",
  }
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full", map[status] || "bg-muted text-muted-foreground")}>
      {status}
    </span>
  )
}

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState<Tab>((searchParams.get("tab") as Tab) || "Today")
  const [search, setSearch]             = useState("")
  const [typeFilter, setTypeFilter]     = useState<"All" | "Physical" | "Online">("All")
  const [rejectTarget, setRejectTarget] = useState<DoctorAppointment | null>(null)
  const [earlyAlertTarget, setEarlyAlertTarget] = useState<DoctorAppointment | null>(null)
  const [rejecting, setRejecting]       = useState(false)
  const [toast, setToast]               = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const loadData = useCallback(async () => {
    setLoading(true)
    const all = await doctorService.getAppointments()
    setAppointments(all)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const todayStr = new Date().toISOString().split("T")[0]

  const filterByTab = (apt: DoctorAppointment): boolean => {
    switch (activeTab) {
      case "Today":     return apt.date === todayStr && apt.status !== "PENDING"
      case "Pending":   return apt.status === "PENDING"
      case "Upcoming":  return apt.date > todayStr && (apt.status === "CONFIRMED" || apt.status === "ACCEPTED")
      case "Completed": return apt.status === "COMPLETED"
      case "Cancelled": return apt.status === "CANCELLED" || apt.status === "REJECTED"
      default:          return true
    }
  }

  const tabCounts: Record<Tab, number> = {
    Today:     appointments.filter(a => a.date === todayStr && a.status !== "PENDING").length,
    Pending:   appointments.filter(a => a.status === "PENDING").length,
    Upcoming:  appointments.filter(a => a.date > todayStr && (a.status === "CONFIRMED" || a.status === "ACCEPTED")).length,
    Completed: appointments.filter(a => a.status === "COMPLETED").length,
    Cancelled: appointments.filter(a => a.status === "CANCELLED" || a.status === "REJECTED").length,
  }

  const filtered = appointments
    .filter(filterByTab)
    .filter(a => typeFilter === "All" || a.consultationType === typeFilter)
    .filter(a =>
      !search ||
      a.patientProfile.name.toLowerCase().includes(search.toLowerCase()) ||
      a.patientProfile.patientId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeStr.localeCompare(b.timeStr))

  const handleAccept = async (id: string) => {
    await doctorService.acceptAppointment(id)
    showToast("Appointment accepted & confirmation email sent!")
    loadData()
  }

  const handleRejectConfirm = async (reason?: string) => {
    if (!rejectTarget) return
    setRejecting(true)
    await doctorService.updateAppointmentStatus(rejectTarget.id, "REJECTED")
    setRejectTarget(null)
    setRejecting(false)
    showToast("Appointment request rejected.")
    loadData()
  }

  const TABS: Tab[] = ["Today", "Pending", "Upcoming", "Completed", "Cancelled"]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-in fade-in">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-foreground text-background px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Appointments</h1>
        <p className="text-muted-foreground mt-1">Manage appointment requests and your schedule.</p>
      </div>

      {/* Search + Type Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient name or ID…"
            className="w-full bg-card border rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 bg-muted/50 p-1.5 rounded-2xl">
          {(["All", "Physical", "Online"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-4 py-1.5 rounded-xl text-sm font-semibold transition-all",
                typeFilter === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 p-1.5 rounded-2xl mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
              activeTab === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                activeTab === tab
                  ? (tab === "Pending" ? "bg-amber-500 text-white" : "bg-primary text-primary-foreground")
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {tabCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-muted rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <CalendarClock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No appointments found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {search ? "Try a different search term." : `No ${activeTab.toLowerCase()} appointments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <div key={apt.id}
              className="bg-card border rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => navigate(`/app/doctor/appointments/${apt.id}`)}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {apt.patientProfile.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{apt.patientProfile.name}</span>
                      <span className="text-xs text-muted-foreground">{apt.patientProfile.patientId}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.date} · {apt.timeStr}</span>
                      <span className={cn("flex items-center gap-1 font-medium",
                        apt.consultationType === "Online" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {apt.consultationType === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {apt.consultationType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-[60px] sm:pl-0">
                  <StatusBadge status={apt.status} />

                  {apt.status === "PENDING" ? (
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" size="sm"
                        onClick={() => setRejectTarget(apt)}
                        className="text-destructive border-destructive/30 hover:bg-destructive/5 text-xs px-3">
                        Reject
                      </Button>
                      <Button size="sm"
                        onClick={() => handleAccept(apt.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3">
                        Accept
                      </Button>
                    </div>
                  ) : (apt.status === "CONFIRMED" || apt.status === "ACCEPTED") && apt.consultationType === "Online" ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button size="sm"
                        onClick={() => {
                          const check = checkMeetingTimeStatus(apt.date, apt.timeStr)
                          if (check.isReady) {
                            navigate(`/telemedicine/${apt.id}`)
                          } else {
                            setEarlyAlertTarget(apt)
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 font-bold rounded-xl gap-1.5 shadow-sm">
                        <Video className="w-3.5 h-3.5" /> Call / Join
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RejectConfirmModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        patientName={rejectTarget?.patientProfile.name}
        isLoading={rejecting}
      />

      {earlyAlertTarget && (
        <EarlyMeetingAlertModal
          isOpen={!!earlyAlertTarget}
          onClose={() => setEarlyAlertTarget(null)}
          onProceedAnyway={() => {
            const id = earlyAlertTarget.id
            setEarlyAlertTarget(null)
            navigate(`/telemedicine/${id}`)
          }}
          doctorName={earlyAlertTarget.doctor?.name || "Doctor"}
          scheduledDate={earlyAlertTarget.date}
          scheduledTime={earlyAlertTarget.timeStr}
          message={checkMeetingTimeStatus(earlyAlertTarget.date, earlyAlertTarget.timeStr).message}
          minutesRemaining={checkMeetingTimeStatus(earlyAlertTarget.date, earlyAlertTarget.timeStr).minutesUntilStart}
          isDoctorView={true}
        />
      )}
    </div>
  )
}
