import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { receptionistService } from "../../lib/receptionist/receptionist-service"
import type { ReceptionistAppointmentView } from "../../lib/receptionist/receptionist-types"
import { PermissionGate } from "../../components/receptionist/PermissionGate"
import { ArrowLeft, User, Building, MapPin, Video, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function ReceptionistAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [apt, setApt] = useState<ReceptionistAppointmentView | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok?: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const loadApt = async () => {
    if (id) {
      setLoading(true)
      const data = await receptionistService.getAppointment(id)
      setApt(data)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApt()
  }, [id])

  const handleAccept = async () => {
    if (!apt) return
    setActionLoading(true)
    try {
      await receptionistService.acceptAppointment(apt.appointmentId)
      showToast("Appointment confirmed.")
      await loadApt()
    } catch {
      showToast("Failed to accept appointment", false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!apt) return
    setActionLoading(true)
    try {
      await receptionistService.rejectAppointment(apt.appointmentId)
      showToast("Appointment request rejected.", false)
      await loadApt()
    } catch {
      showToast("Failed to reject appointment", false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!apt) return
    setActionLoading(true)
    try {
      await receptionistService.checkInPatient(apt.appointmentId)
      showToast("Patient marked as Checked In.")
      await loadApt()
    } catch {
      showToast("Failed to check in patient", false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!apt) return
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return
    setActionLoading(true)
    try {
      await receptionistService.cancelAppointment(apt.appointmentId)
      showToast("Appointment cancelled.", false)
      await loadApt()
    } catch {
      showToast("Failed to cancel appointment", false)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-24 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-3xl" />
      </div>
    )
  }

  if (!apt) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto text-center py-20">
        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold">Appointment Not Found</h3>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline mt-2">Go back</button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto animate-in fade-in space-y-6">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2 ${
          toast.ok !== false ? "bg-emerald-600 text-white" : "bg-foreground text-background"
        }`}>
          {toast.msg}
        </div>
      )}

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Appointments
      </button>

      <div className="bg-card border rounded-3xl shadow-sm overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  apt.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                  apt.status === "CONFIRMED" || apt.status === "ACCEPTED" ? "bg-blue-100 text-blue-700" :
                  apt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {apt.status}
                </span>
                {apt.checkInStatus && (apt.status === "CONFIRMED" || apt.status === "ACCEPTED") && (
                  <span className={`text-xs font-bold ${apt.checkInStatus === "Checked In" ? "text-emerald-500" : "text-primary"}`}>
                    • {apt.checkInStatus}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{apt.patientName}</h1>
              <p className="text-muted-foreground font-medium text-sm mt-1">ID: {apt.patientIdentifier}</p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Schedule</p>
              <div className="flex items-center gap-2 sm:justify-end text-lg font-bold">
                <Clock className="w-5 h-5 text-primary" />
                {apt.date} • {apt.timeStr}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-8 bg-muted/5">
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Provider Information</p>
              <div className="flex items-center gap-3 bg-card border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{apt.doctor.name}</p>
                  <p className="text-xs text-muted-foreground">{apt.doctor.specialization || "General Medicine"}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Consultation Type</p>
              <div className="flex items-center gap-3 bg-card border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {apt.type === "Online" ? <Video className="w-5 h-5 text-primary" /> : <MapPin className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <p className="font-bold">{apt.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {apt.type === "Online" ? "Telemedicine Video Session" : "In-Person Clinic Visit"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Facility</p>
              <div className="flex items-center gap-3 bg-card border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{apt.organization.name}</p>
                  <p className="text-xs text-muted-foreground">{apt.organization.city}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Actions Section */}
        <div className="p-6 sm:p-8 border-t bg-card">
          <div className="flex flex-wrap items-center gap-3">
            
            {apt.status === "PENDING" && (
              <PermissionGate permission="canApproveAppointments">
                <button 
                  disabled={actionLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                  onClick={handleAccept}
                >
                  <CheckCircle className="w-5 h-5" /> Accept Appointment
                </button>
                <button 
                  disabled={actionLoading}
                  className="bg-background border border-input hover:bg-destructive/10 hover:text-destructive font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                  onClick={handleReject}
                >
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </PermissionGate>
            )}

            {(apt.status === "CONFIRMED" || apt.status === "ACCEPTED") && apt.checkInStatus !== "Checked In" && (
              <PermissionGate permission="canCheckInPatients">
                <button 
                  disabled={actionLoading}
                  className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                  onClick={handleCheckIn}
                >
                  <CheckCircle className="w-5 h-5" /> Mark Checked In
                </button>
              </PermissionGate>
            )}

            {(apt.status === "CONFIRMED" || apt.status === "ACCEPTED" || apt.status === "PENDING") && (
              <PermissionGate permission="canCancelAppointments">
                <button 
                  disabled={actionLoading}
                  className="ml-auto text-destructive hover:bg-destructive/10 font-bold px-6 py-2.5 rounded-xl transition-colors"
                  onClick={handleCancel}
                >
                  Cancel Appointment
                </button>
              </PermissionGate>
            )}

          </div>
        </div>

      </div>

    </div>
  )
}
