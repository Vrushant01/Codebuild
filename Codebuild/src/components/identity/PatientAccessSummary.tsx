import React, { useEffect, useState } from "react"
import { ShieldCheck, Calendar, FileText, AlertCircle, ShieldAlert, Pill } from "lucide-react"
import { useAuth } from "../../lib/auth/AuthContext"
import { patientIdentityService, type PatientIdentity, type PatientAccessPermissions } from "../../lib/identity/patient-identity-service"
import { PatientAllergyPanel } from "./PatientAllergyPanel"

interface PatientAccessSummaryProps {
  patient: PatientIdentity
  onClose: () => void
}

export function PatientAccessSummary({ patient, onClose }: PatientAccessSummaryProps) {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<PatientAccessPermissions | null>(null)
  const [clinicalData, setClinicalData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAccess() {
      setLoading(true)
      
      const role = user?.role as "DOCTOR" | "RECEPTIONIST" | "ADMIN"
      const perms = patientIdentityService.getPatientAccessPermissions(role || "DOCTOR")
      setPermissions(perms)

      if (perms.canViewMedicalHistory || perms.canViewAllergies) {
        const data = await patientIdentityService.getMockClinicalData(patient.patientId)
        setClinicalData(data)
      }
      
      setLoading(false)
    }
    loadAccess()
  }, [user, patient])

  if (loading || !permissions) {
    return <div className="text-center p-12 text-muted-foreground animate-pulse">Checking access permissions...</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {patient.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{patient.displayName}</h2>
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-mono text-muted-foreground font-semibold tracking-wider">
              {patient.patientId}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg px-2">Authorized Information</h3>
        <p className="text-sm text-muted-foreground px-2 mb-4">
          Information is shown according to your current role ({user?.role}).
        </p>

        {/* Appointment Context (Always visible to Doctor & Receptionist) */}
        {permissions.canViewAppointment ? (
          <div className="bg-card border rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Today's Appointment</h4>
              <p className="text-muted-foreground">10 Sep · 10:30 AM — Follow-up visit</p>
              <button className="mt-3 text-sm font-semibold text-primary hover:underline">
                Open appointment details
              </button>
            </div>
          </div>
        ) : (
          <RestrictedCard title="Appointment Context" />
        )}

        {/* Medical History */}
        {permissions.canViewMedicalHistory ? (
          <div className="bg-card border rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">Medical History</h4>
              <p className="text-muted-foreground">
                {clinicalData?.cases?.length || 0} previous cases recorded.
              </p>
              <button className="mt-3 text-sm font-semibold text-primary hover:underline">
                View full medical history
              </button>
            </div>
          </div>
        ) : (
          <RestrictedCard title="Medical History" />
        )}

        {/* Allergies & Medications */}
        <div className="grid sm:grid-cols-2 gap-4">
          {permissions.canViewAllergies ? (
            <PatientAllergyPanel patientId={patient.patientId} isAuthorized={permissions.canViewAllergies} />
          ) : (
            <RestrictedCard title="Allergies" compact />
          )}

          {permissions.canViewMedication ? (
            <div className="bg-card border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Pill className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">Medications</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                2 active prescriptions.
              </p>
              <button className="text-sm font-semibold text-primary hover:underline">
                View medications
              </button>
            </div>
          ) : (
            <RestrictedCard title="Medications" compact />
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={onClose}
          className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Close Identity Viewer
        </button>
      </div>

    </div>
  )
}

function RestrictedCard({ title, compact = false }: { title: string, compact?: boolean }) {
  return (
    <div className={`bg-muted/30 border border-dashed rounded-2xl flex items-start gap-4 ${compact ? 'p-5' : 'p-6'}`}>
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div>
        <h4 className={`font-semibold text-muted-foreground ${compact ? 'text-base mb-1' : 'text-lg mb-1'}`}>{title}</h4>
        <p className="text-xs text-muted-foreground">Not available for your role.</p>
      </div>
    </div>
  )
}
