import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, User, Calendar, Activity, Pill, ShieldAlert, History } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

import { doctorService } from "../../lib/doctor/doctor-service"
import { medicalHistoryService } from "../../lib/history/medical-history-service"
import { scheduleService } from "../../lib/schedule/schedule-service"

import type { MedicalCase, Allergy, HistoryTimelineItem } from "../../lib/history/medical-history-types"
import type { Medicine } from "../../lib/schedule/schedule-types"
import type { DoctorPatient } from "../../lib/doctor/doctor-types"

import { CaseDetailDrawer } from "../../components/history/CaseDetailDrawer"
import { AllergySection } from "../../components/history/AllergySection"
import { MedicalPrivacyNotice } from "../../components/history/MedicalPrivacyNotice"

type Tab = "OVERVIEW" | "CASES" | "PREVIOUS_CASES" | "MEDICINES" | "ALLERGIES" | "APPOINTMENTS"

export default function DoctorPatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<Tab>("OVERVIEW")
  const [loading, setLoading] = useState(true)
  
  const [patient, setPatient] = useState<DoctorPatient | null>(null)
  const [currentCases, setCurrentCases] = useState<MedicalCase[]>([])
  const [previousCases, setPreviousCases] = useState<MedicalCase[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)

  const loadData = async () => {
    if (!patientId) return
    setLoading(true)
    const [pList, cCases, pCases, aList, mList] = await Promise.all([
      doctorService.getPatients(),
      medicalHistoryService.getCurrentCases(patientId),
      medicalHistoryService.getPreviousCases(patientId),
      medicalHistoryService.getAllergies(patientId),
      scheduleService.getMedicines(patientId)
    ])
    const foundPatient = pList.find(p => p.patientId === patientId || p.id === patientId) || pList[0] || null
    setPatient(foundPatient)
    setCurrentCases(cCases)
    setPreviousCases(pCases)
    setAllergies(aList)
    setMedicines(mList)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [patientId])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-muted rounded-3xl" />
        <div className="h-64 bg-muted rounded-3xl" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-8 text-center max-w-md mx-auto py-20">
        <h2 className="text-xl font-bold">Patient Not Found</h2>
        <p className="text-muted-foreground mt-2">No clinical record found for ID: {patientId}</p>
        <button 
          onClick={() => navigate('/app/doctor/patients')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold"
        >
          Return to Patients List
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background animate-in fade-in pb-24">
      
      {/* Patient Context Header */}
      <div className="bg-card border-b px-4 py-6 sm:px-8 sm:py-8 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center shrink-0 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
              {patient.avatarInitials}
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">{patient.name}</h1>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <User className="w-4 h-4" /> {patient.patientId} 
                <span className="mx-1">•</span>
                <Calendar className="w-4 h-4" /> Last visit: {patient.lastAppointmentDate || "Unknown"}
              </p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl shadow-sm gap-2 whitespace-nowrap">
            Book Appointment
          </Button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar">
          {["OVERVIEW", "CASES", "PREVIOUS_CASES", "MEDICINES", "ALLERGIES", "APPOINTMENTS"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all", 
                activeTab === tab ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <MedicalPrivacyNotice isDoctorView className="mb-6" />

        <div className="animate-in fade-in slide-in-from-bottom-4">
          
          {/* OVERVIEW */}
          {activeTab === "OVERVIEW" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Current Cases */}
              <div className="bg-card border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Current Cases</h3>
                </div>
                {currentCases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active cases.</p>
                ) : (
                  <div className="space-y-3">
                    {currentCases.map(c => (
                      <div key={c.id} className="bg-primary/5 border border-primary/10 rounded-2xl p-4 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setSelectedCaseId(c.id)}>
                        <h4 className="font-bold">{c.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Started {c.startDate}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div className="bg-card border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Allergies</h3>
                </div>
                {allergies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No known allergies.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {allergies.map(a => (
                      <div key={a.id} className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3 flex justify-between items-center text-sm">
                        <span className="font-bold text-red-900 dark:text-red-200">{a.name}</span>
                        {a.severity && <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">{a.severity}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Meds */}
              <div className="bg-card border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-lg">Current Medication</h3>
                </div>
                {medicines.filter(m => m.status === "active").length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active medication.</p>
                ) : (
                  <div className="space-y-3">
                    {medicines.filter(m => m.status === "active").map(m => (
                      <div key={m.id} className="bg-muted/50 border rounded-2xl p-3">
                        <h4 className="font-bold text-sm">{m.name}</h4>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{m.dosage} • {m.frequency}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CASES */}
          {activeTab === "CASES" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-heading">Current Cases</h2>
              {currentCases.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl font-medium">No active cases.</div>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  {currentCases.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCaseId(c.id)}
                      className="bg-card border rounded-2xl p-5 hover:border-primary/40 cursor-pointer shadow-sm transition-all"
                    >
                       <div className="flex justify-between items-start gap-4 mb-3">
                         <div>
                           <h3 className="font-bold text-lg">{c.title}</h3>
                           <p className="text-sm font-medium text-muted-foreground mt-0.5">Started: {c.startDate}</p>
                         </div>
                         <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-700 mt-1">
                           {c.status}
                         </span>
                       </div>
                       {c.symptoms.length > 0 && (
                         <div className="flex gap-2 flex-wrap">
                           {c.symptoms.map(s => <span key={s} className="bg-muted text-xs font-bold px-2 py-1 rounded-md">{s}</span>)}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PREVIOUS CASES */}
          {activeTab === "PREVIOUS_CASES" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-heading">Previous Cases</h2>
              {previousCases.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl font-medium">No previous cases.</div>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  {previousCases.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCaseId(c.id)}
                      className="bg-card border rounded-2xl p-5 hover:border-primary/40 cursor-pointer shadow-sm transition-all opacity-80 hover:opacity-100"
                    >
                       <div className="flex justify-between items-start gap-4">
                         <div>
                           <h3 className="font-bold text-lg">{c.title}</h3>
                           <p className="text-sm font-medium text-muted-foreground mt-0.5">{c.doctorName} • {c.organizationName}</p>
                         </div>
                         <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-muted text-muted-foreground mt-1">
                           {c.status}
                         </span>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MEDICINES */}
          {activeTab === "MEDICINES" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-bold font-heading">Medication History</h2>
              <div className="space-y-4">
                {medicines.map(m => (
                  <div key={m.id} className="bg-card border rounded-2xl p-5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">{m.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">{m.dosage} • {m.frequency}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      m.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    )}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALLERGIES */}
          {activeTab === "ALLERGIES" && (
            <div className="max-w-4xl">
              <AllergySection 
                allergies={allergies}
                onAdd={async () => {}} // Read-only for doctor in this view, typically handled via appointment actions
                onUpdate={async () => {}}
                onDelete={async () => {}}
                isDoctorView={true}
              />
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === "APPOINTMENTS" && (
            <div className="py-12 text-center border-2 border-dashed rounded-3xl bg-card max-w-3xl">
              <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold">Appointment History</h3>
              <p className="text-muted-foreground text-sm">Appointments logic is managed through the central appointment hub.</p>
            </div>
          )}

        </div>
      </div>

      <CaseDetailDrawer 
        isOpen={selectedCaseId !== null} 
        onClose={() => setSelectedCaseId(null)} 
        caseId={selectedCaseId} 
      />

    </div>
  )
}
