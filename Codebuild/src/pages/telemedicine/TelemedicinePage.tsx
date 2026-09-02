import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../lib/auth/AuthContext"
import { appointmentService } from "../../lib/booking/appointment-service"
import type { Appointment } from "../../lib/booking/appointment-types"
import { TelemedicineProvider, useTelemedicine } from "../../lib/telemedicine/TelemedicineContext"
import { PreCallCheck } from "../../components/telemedicine/PreCallCheck"
import { WaitingRoom } from "../../components/telemedicine/WaitingRoom"
import { TelemedicineRoom } from "../../components/telemedicine/TelemedicineRoom"
import { ConsultationSummary } from "../../components/telemedicine/ConsultationSummary"
import { Loader2 } from "lucide-react"

function TelemedicineFlow({ appointment }: { appointment: Appointment }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { status, joinConsultation, durationSeconds } = useTelemedicine()
  
  // Local state to track which step we are on
  const [step, setStep] = useState<'PRE_CALL' | 'WAITING' | 'ROOM' | 'SUMMARY'>('PRE_CALL')

  const role = user?.role === 'DOCTOR' ? 'doctor' : 'patient'
  const doctorName = appointment.doctor.name
  const patientName = appointment.appointmentFor === 'Myself' ? 'Krish Barvaliya' : (appointment.familyMemberName || 'Patient')

  // Auto-progress state based on status
  useEffect(() => {
    if (status === "WAITING") {
      setStep("WAITING")
    } else if (status === "CONNECTING" || status === "CONNECTED" || status === "RECONNECTING") {
      setStep("ROOM")
    } else if (status === "ENDED") {
      setStep("SUMMARY")
    }
  }, [status])

  const handleJoinClick = async () => {
    if (role === 'patient') {
      // Patient joins, goes to waiting room
      await joinConsultation(appointment.id, role)
    } else {
      // Doctor joins, goes to waiting room where they see patient waiting
      setStep('WAITING')
    }
  }

  const handleDoctorStart = async () => {
    await joinConsultation(appointment.id, role)
  }

  const handleLeave = () => {
    navigate(role === 'doctor' ? "/doctor/appointments" : "/patient/appointments")
  }

  if (step === 'PRE_CALL') {
    return (
      <PreCallCheck 
        onJoin={handleJoinClick}
        doctorName={doctorName}
        appointmentTime={`${appointment.date} · ${appointment.timeStr}`}
        consultationType={appointment.consultationType}
      />
    )
  }

  if (step === 'WAITING') {
    return (
      <WaitingRoom 
        role={role}
        doctorName={doctorName}
        patientName={patientName}
        appointmentTime={`${appointment.date} · ${appointment.timeStr}`}
        onStartDoctor={handleDoctorStart}
        onLeave={handleLeave}
      />
    )
  }

  if (step === 'ROOM') {
    return (
      <TelemedicineRoom 
        role={role}
        doctorName={doctorName}
        patientName={patientName}
        patientId={user?.id || 'demo_user'}
      />
    )
  }

  if (step === 'SUMMARY') {
    return (
      <ConsultationSummary 
        role={role}
        doctorName={doctorName}
        patientName={patientName}
        durationSeconds={durationSeconds}
        onPrimaryAction={() => {
          if (role === 'patient') {
            navigate('/patient/schedule')
          } else {
            navigate('/doctor/dashboard')
          }
        }}
        onSecondaryAction={() => {
          if (role === 'patient') {
            navigate(`/patient/appointments/${appointment.id}`)
          } else {
            navigate(`/doctor/appointments/${appointment.id}`)
          }
        }}
      />
    )
  }

  return null
}

export default function TelemedicinePage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadAppointment = async () => {
      if (!appointmentId) return
      setLoading(true)
      const apt = await appointmentService.getAppointment(appointmentId)
      
      if (!apt) {
        // Fallback for demo if id doesn't match a mock exactly
        setError("This consultation could not be found.")
      } else if (apt.consultationType !== "Online") {
        setError("This appointment is not an online consultation.")
      } else if (apt.status === "CANCELLED" || apt.status === "REJECTED") {
        setError("This consultation has been cancelled.")
      } else {
        setAppointment(apt)
      }
      setLoading(false)
    }
    loadAppointment()
  }, [appointmentId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading consultation...</p>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive font-bold text-xl">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">{error || "You don't have access to this consultation."}</p>
          <button 
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-medium"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <TelemedicineProvider>
      <TelemedicineFlow appointment={appointment} />
    </TelemedicineProvider>
  )
}
