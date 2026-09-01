import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { receptionistService } from "../../lib/receptionist/receptionist-service"
import type { ReceptionistPatientView, ReceptionistAppointmentView } from "../../lib/receptionist/receptionist-types"
import { ArrowLeft, User, Phone, Mail, Calendar, Clock, MapPin, Video, ShieldAlert } from "lucide-react"

export default function ReceptionistPatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [patient, setPatient] = useState<ReceptionistPatientView | null>(null)
  const [appointments, setAppointments] = useState<ReceptionistAppointmentView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPatient = async () => {
      if (id) {
        setLoading(true)
        const [patientData, allApts] = await Promise.all([
          receptionistService.getPatient(id),
          receptionistService.getAppointments()
        ])
        setPatient(patientData)
        setAppointments(allApts.filter(a => a.patientId === id))
        setLoading(false)
      }
    }
    loadPatient()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-40 bg-muted rounded-3xl" />
        <div className="h-64 bg-muted rounded-3xl" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-center py-20">
        <h3 className="text-xl font-bold">Patient Not Found</h3>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline mt-2">Go back</button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in space-y-6">
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </button>

      {/* Patient Header */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-10 h-10 text-primary" />
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{patient.patientName}</h1>
          <p className="text-muted-foreground font-medium mt-1">ID: {patient.patientIdentifier}</p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border">
              <Phone className="w-4 h-4" /> {patient.mobile}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border">
              <Mail className="w-4 h-4" /> {patient.email}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Appointment History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">Appointment History</h2>
          
          <div className="space-y-4">
            {appointments.map(apt => (
              <div 
                key={apt.appointmentId} 
                onClick={() => navigate(`/app/receptionist/appointments/${apt.appointmentId}`)}
                className="bg-card border rounded-2xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group flex flex-col sm:flex-row justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">{apt.date}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {apt.timeStr}</span>
                  </div>
                  <div className="text-sm">Provider: <span className="font-semibold">{apt.doctor.name}</span></div>
                  <div className="text-sm mt-1 text-muted-foreground flex items-center gap-1">
                    {apt.type === "Online" ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />} {apt.type}
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    apt.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                    apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                    apt.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protected Information Boundary Warning */}
        <div className="space-y-4">
          <div className="bg-destructive/5 border border-destructive/10 rounded-3xl p-6 text-destructive">
            <ShieldAlert className="w-8 h-8 mb-4" />
            <h3 className="font-bold text-lg mb-2">Protected Record</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Clinical information, including medical history, diagnosis, allergies, and prescriptions, is strictly limited to authorized healthcare providers.
            </p>
            <p className="text-sm opacity-90 leading-relaxed mt-4">
              Front desk operations only require access to appointment schedules and basic contact information.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}
