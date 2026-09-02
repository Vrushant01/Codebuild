import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doctorService } from "../../lib/doctor/doctor-service"
import { profileService } from "../../lib/profile/profile-service"
import type { DoctorAppointment } from "../../lib/doctor/doctor-types"
import type { Allergy, HistoryTimelineItem } from "../../lib/profile/profile-types"
import { PatientContextPanel } from "../../components/doctor/PatientContextPanel"
import { UpdateCaseModal } from "../../components/doctor/UpdateCaseModal"
import { AddMedicationModal } from "../../components/doctor/AddMedicationModal"
import { RejectConfirmModal } from "../../components/doctor/RejectConfirmModal"
import { scheduleService } from "../../lib/schedule/schedule-service"
import type { Medicine } from "../../lib/schedule/schedule-types"
import { EarlyMeetingAlertModal } from "../../components/telemedicine/EarlyMeetingAlertModal"
import { checkMeetingTimeStatus } from "../../lib/booking/meeting-time-utils"
import { Button } from "../../components/ui/button"
import {
  ArrowLeft, Clock, Calendar, CheckCircle2, Video, MapPin,
  Edit3, Pill, User, XCircle, Check, AlertTriangle, History
} from "lucide-react"
import { cn } from "../../lib/utils"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-muted text-muted-foreground",
    REJECTED:  "bg-destructive/10 text-destructive",
  }
  return (
    <span className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full", map[status] || "bg-muted text-muted-foreground")}>
      {status}
    </span>
  )
}

export default function DoctorAppointmentDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const [apt, setApt]         = useState<DoctorAppointment | null>(null)
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [timeline, setTimeline]   = useState<HistoryTimelineItem[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading]     = useState(true)

  const [caseModalOpen, setCaseModalOpen]       = useState(false)
  const [medModalOpen, setMedModalOpen]         = useState(false)
  const [rejectModalOpen, setRejectModalOpen]   = useState(false)
  const [cancelModalOpen, setCancelModalOpen]   = useState(false)
  const [earlyModalOpen, setEarlyModalOpen]     = useState(false)
  const [actionLoading, setActionLoading]       = useState(false)

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      const appointment = await doctorService.getAppointmentById(id)
      if (appointment) {
        setApt(appointment)
        setAllergies(appointment.allergies || [])
        setTimeline(appointment.medicalHistory || [])
        setMedicines(appointment.medicines || [])
      }
      setLoading(false)
    }
    loadData()
  }, [id])

  const refresh = async () => {
    if (!id) return
    const a = await doctorService.getAppointmentById(id)
    if (a) {
      setApt(a)
      setAllergies(a.allergies || [])
      setTimeline(a.medicalHistory || [])
      setMedicines(a.medicines || [])
    }
  }

  const handleAccept = async () => {
    if (!apt) return
    setActionLoading(true)
    await doctorService.updateAppointmentStatus(apt.id, "CONFIRMED")
    showToast("Appointment confirmed.")
    await refresh()
    setActionLoading(false)
  }

  const handleReject = async (reason?: string) => {
    if (!apt) return
    setActionLoading(true)
    await doctorService.updateAppointmentStatus(apt.id, "REJECTED")
    setRejectModalOpen(false)
    showToast("Appointment rejected.", false)
    await refresh()
    setActionLoading(false)
  }

  const handleCancel = async (reason?: string) => {
    if (!apt) return
    setActionLoading(true)
    await doctorService.cancelAppointment(apt.id, reason)
    setCancelModalOpen(false)
    showToast("Appointment cancelled.", false)
    await refresh()
    setActionLoading(false)
  }

  const handleComplete = async () => {
    if (!apt) return
    setActionLoading(true)
    await doctorService.updateAppointmentStatus(apt.id, "COMPLETED")
    showToast("Appointment marked as completed.")
    await refresh()
    setActionLoading(false)
  }

  if (loading) return <div className="p-8 animate-pulse text-center text-muted-foreground">Loading appointment details…</div>
  if (!apt)    return <div className="p-8 text-center text-destructive">Appointment not found.</div>

  const isPending   = apt.status === "PENDING"
  const isConfirmed = apt.status === "CONFIRMED" || apt.status === "ACCEPTED"
  const isCompleted = apt.status === "COMPLETED"
  const isClosed    = apt.status === "CANCELLED" || apt.status === "REJECTED" || isCompleted

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2",
          toast.ok ? "bg-emerald-600 text-white" : "bg-foreground text-background"
        )}>
          {toast.msg}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to appointments
      </button>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left: Patient & Clinical */}
        <div className="flex-1 space-y-6">

          {/* Patient Identity Card */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                  {apt.patientProfile.avatarInitials}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{apt.patientProfile.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                    <User className="w-4 h-4" /> {apt.patientProfile.patientId}
                  </div>
                </div>
              </div>
              <StatusBadge status={apt.status} />
            </div>
            <div className="mt-6 pt-6 border-t border-dashed">
              <Button onClick={() => navigate(`/app/doctor/patients/${apt.patientProfile.patientId}`)} variant="outline" className="w-full justify-between h-auto py-3 px-4 rounded-xl group">
                <span className="flex items-center font-semibold"><History className="w-4 h-4 mr-2 text-muted-foreground" /> View full patient history</span>
                <span className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all">→</span>
              </Button>
            </div>
          </div>

          {/* Clinical context */}
          <PatientContextPanel
            isAuthorized={true}
            profile={apt.patientProfile}
            currentCase={apt.currentCase}
            allergies={allergies}
            timeline={timeline}
            medicines={medicines}
          />
        </div>

        {/* Right: Appointment Details + Actions */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-4">

          {/* Meta */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-base">Appointment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="font-medium text-foreground">{apt.date}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="font-medium text-foreground">{apt.timeStr}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                {apt.consultationType === "Online" ? <Video className="w-4 h-4 shrink-0 text-blue-500" /> : <MapPin className="w-4 h-4 shrink-0 text-emerald-500" />}
                <span className="font-medium text-foreground">{apt.consultationType} Consultation</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="font-medium text-foreground">{apt.organization.name}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-base">Actions</h3>

            {isPending && (
              <>
                <Button onClick={handleAccept} disabled={actionLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5">
                  <Check className="w-4 h-4 mr-2" /> Accept Appointment
                </Button>
                <Button variant="outline" onClick={() => setRejectModalOpen(true)} disabled={actionLoading}
                  className="w-full rounded-2xl py-5 text-destructive border-destructive/30 hover:bg-destructive/5">
                  <XCircle className="w-4 h-4 mr-2" /> Reject Appointment
                </Button>
              </>
            )}

            {isConfirmed && apt.consultationType === "Online" && (
              <Button 
                onClick={() => {
                  const check = checkMeetingTimeStatus(apt.date, apt.timeStr)
                  if (check.isReady) {
                    navigate(`/telemedicine/${apt.id}`)
                  } else {
                    setEarlyModalOpen(true)
                  }
                }} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-5 font-bold shadow-lg shadow-blue-500/20"
              >
                <Video className="w-4 h-4 mr-2" /> Join Video Consultation
              </Button>
            )}

            {isConfirmed && (
              <Button onClick={handleComplete} disabled={actionLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Completed
              </Button>
            )}

            {isCompleted && (
              <>
                <Button variant="outline" onClick={() => setCaseModalOpen(true)} className="w-full rounded-2xl py-5">
                  <Edit3 className="w-4 h-4 mr-2" /> Update Case & Diagnosis
                </Button>
                <Button variant="outline" onClick={() => setMedModalOpen(true)} className="w-full rounded-2xl py-5 text-primary border-primary/20 hover:bg-primary/5">
                  <Pill className="w-4 h-4 mr-2" /> Prescribe Medication
                </Button>
              </>
            )}

            {(isConfirmed || isPending) && (
              <Button variant="ghost" onClick={() => setCancelModalOpen(true)} disabled={actionLoading}
                className="w-full rounded-2xl py-5 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                <AlertTriangle className="w-4 h-4 mr-2" /> Cancel Appointment
              </Button>
            )}

            {isClosed && !isCompleted && (
              <p className="text-xs text-center text-muted-foreground py-2">
                This appointment is {apt.status.toLowerCase()}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RejectConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
        patientName={apt.patientProfile.name}
        isLoading={actionLoading}
      />

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border rounded-3xl p-6 shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg">Cancel this appointment?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">The patient will be notified of the cancellation.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="flex-1">Keep it</Button>
              <Button onClick={() => handleCancel()} disabled={actionLoading}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {actionLoading ? "Cancelling…" : "Cancel appointment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <UpdateCaseModal
        isOpen={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        appointmentId={apt.id}
        onSave={async (data) => { await doctorService.updateCase(apt.id, data) }}
      />

      <AddMedicationModal
        isOpen={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        onSave={async (data) => { 
           await doctorService.addMedication(apt.patientProfile?.id || apt.id, data) 
           showToast("Prescription added to patient's medicine schedule!")
           await refresh()
        }}
      />

      {apt && (
        <EarlyMeetingAlertModal
          isOpen={earlyModalOpen}
          onClose={() => setEarlyModalOpen(false)}
          onProceedAnyway={() => {
            setEarlyModalOpen(false)
            navigate(`/telemedicine/${apt.id}`)
          }}
          doctorName={apt.doctor?.name || "Doctor"}
          scheduledDate={apt.date}
          scheduledTime={apt.timeStr}
          message={checkMeetingTimeStatus(apt.date, apt.timeStr).message}
          minutesRemaining={checkMeetingTimeStatus(apt.date, apt.timeStr).minutesUntilStart}
          isDoctorView={true}
        />
      )}
    </div>
  )
}
