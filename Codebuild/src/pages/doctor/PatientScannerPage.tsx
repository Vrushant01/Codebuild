import React, { useState } from "react"
import { QRScanner } from "../../components/identity/QRScanner"
import { PatientAccessSummary } from "../../components/identity/PatientAccessSummary"
import { patientIdentityService, type PatientIdentity } from "../../lib/identity/patient-identity-service"
import { AlertCircle, ArrowLeft } from "lucide-react"

type ScannerState = "SCANNING" | "LOADING" | "ERROR" | "FOUND" | "CONFIRMATION"

export default function PatientScannerPage() {
  const [state, setState] = useState<ScannerState>("SCANNING")
  const [patient, setPatient] = useState<PatientIdentity | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  const handlePatientLookup = async (id: string) => {
    setState("LOADING")
    
    if (!patientIdentityService.validatePatientId(id)) {
      setErrorMsg("This QR code isn't a valid Medireach Patient ID.")
      setState("ERROR")
      return
    }

    const found = await patientIdentityService.findMockPatientById(id)
    if (found) {
      setPatient(found)
      setState("CONFIRMATION")
    } else {
      setErrorMsg("Patient ID not found. Check the code and try again.")
      setState("ERROR")
    }
  }

  const handleScanSuccess = (decodedText: string) => {
    // Basic guard so we don't spam lookups
    if (state === "SCANNING") {
      handlePatientLookup(decodedText)
    }
  }

  const handleManualEntry = (manualId: string) => {
    if (state === "SCANNING" || state === "ERROR") {
      handlePatientLookup(manualId)
    }
  }

  const handleReset = () => {
    setState("SCANNING")
    setPatient(null)
    setErrorMsg("")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 min-h-[calc(100vh-5rem)]">
      
      {state !== "FOUND" && (
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Identify Patient</h1>
          <p className="text-muted-foreground">
            Scan a Medireach Patient QR code or enter the Patient ID manually to quickly access authorized information.
          </p>
        </div>
      )}

      {state === "SCANNING" && (
        <QRScanner 
          onScanSuccess={handleScanSuccess} 
          onManualEntry={handleManualEntry} 
        />
      )}

      {state === "LOADING" && (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="font-semibold">Identifying patient...</p>
        </div>
      )}

      {state === "ERROR" && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Patient not found</h2>
          <p className="text-red-600/80 dark:text-red-400/80 mb-6">{errorMsg}</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleReset}
              className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 px-6 py-2 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Scan again
            </button>
          </div>
        </div>
      )}

      {state === "CONFIRMATION" && patient && (
        <div className="bg-card border rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4">
            {patient.avatarInitials}
          </div>
          <p className="text-sm font-semibold tracking-wide text-primary mb-1 uppercase">Patient Identified</p>
          <h2 className="text-2xl font-bold mb-2">{patient.displayName}</h2>
          <p className="font-mono text-muted-foreground font-bold tracking-wider mb-8">{patient.patientId}</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleReset}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setState("FOUND")}
              className="flex-1 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
            >
              Confirm Identity
            </button>
          </div>
        </div>
      )}

      {state === "FOUND" && patient && (
        <div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Scan another patient
          </button>
          <PatientAccessSummary patient={patient} onClose={handleReset} />
        </div>
      )}

    </div>
  )
}
