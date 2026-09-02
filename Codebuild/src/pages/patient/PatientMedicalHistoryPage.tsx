import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, Activity, Pill, History, Calendar } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

import { medicalHistoryService } from "../../lib/history/medical-history-service"
import type { MedicalCase, Allergy, HistoryTimelineItem } from "../../lib/history/medical-history-types"

import { HealthJourney } from "../../components/history/HealthJourney"
import { CaseDetailDrawer } from "../../components/history/CaseDetailDrawer"
import { AllergySection } from "../../components/history/AllergySection"
import { MedicalPrivacyNotice } from "../../components/history/MedicalPrivacyNotice"

type Tab = "OVERVIEW" | "CASES" | "ALLERGIES" | "JOURNEY"

export default function PatientMedicalHistoryPage() {
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<Tab>("OVERVIEW")
  const [loading, setLoading] = useState(true)
  
  const [currentCases, setCurrentCases] = useState<MedicalCase[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [timeline, setTimeline] = useState<HistoryTimelineItem[]>([])
  
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const [c, a, t] = await Promise.all([
      medicalHistoryService.getCurrentCases("PAT-8F2A91"),
      medicalHistoryService.getAllergies("PAT-8F2A91"),
      medicalHistoryService.getPatientHistory("PAT-8F2A91")
    ])
    setCurrentCases(c)
    setAllergies(a)
    setTimeline(t)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAllergyAdd = async (data: Partial<Allergy>) => {
    await medicalHistoryService.addAllergy(data as any)
    await loadData()
  }
  const handleAllergyUpdate = async (id: string, data: Partial<Allergy>) => {
    await medicalHistoryService.updateAllergy(id, data)
    await loadData()
  }
  const handleAllergyDelete = async (id: string) => {
    await medicalHistoryService.removeAllergy(id)
    await loadData()
  }

  const handleTimelineClick = (item: HistoryTimelineItem) => {
    if (item.type.includes("Case") && item.referenceId) {
      setSelectedCaseId(item.referenceId)
    } else if (item.type.includes("Allergy")) {
      setActiveTab("ALLERGIES")
    } else if (item.type === "Appointment") {
      navigate("/app/patient/appointments")
    } else if (item.type.includes("Medicine")) {
      navigate("/app/patient/schedule")
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-background pb-24 lg:pb-0 animate-in fade-in">
      
      {/* Header */}
      <div className="bg-card border-b px-4 py-6 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black">My Health</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Your healthcare history, medicines, and allergies in one place.</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-8 overflow-x-auto no-scrollbar border-b">
            {["OVERVIEW", "CASES", "ALLERGIES", "JOURNEY"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={cn(
                  "px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 capitalize", 
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "JOURNEY" ? "Health Journey" : tab.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 bg-muted rounded-3xl w-full" />
            <div className="h-64 bg-muted rounded-3xl w-full" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
            
            <MedicalPrivacyNotice />

            {/* OVERVIEW TAB */}
            {activeTab === "OVERVIEW" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Case Card */}
                <div 
                  onClick={() => setActiveTab("CASES")}
                  className="bg-primary/5 border border-primary/20 rounded-3xl p-6 cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-primary" />
                    <h3 className="font-bold text-lg">Active Cases</h3>
                  </div>
                  {currentCases.length > 0 ? (
                    <div>
                      <h4 className="text-2xl font-black">{currentCases[0].title}</h4>
                      <p className="text-sm font-medium text-muted-foreground mt-1">Started on {currentCases[0].startDate}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-medium">No active cases recorded.</p>
                  )}
                </div>

                {/* Allergies Card */}
                <div 
                  onClick={() => setActiveTab("ALLERGIES")}
                  className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 cursor-pointer hover:border-red-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-6 h-6" />
                    <h3 className="font-bold text-lg">Known Allergies</h3>
                  </div>
                  {allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {allergies.map(a => (
                        <span key={a.id} className="bg-background border rounded-lg px-2.5 py-1 text-sm font-bold shadow-sm">{a.name}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-medium">No allergies added.</p>
                  )}
                </div>

                {/* Quick Links */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <Button onClick={() => navigate("/app/patient/schedule")} variant="outline" className="h-auto py-4 rounded-2xl justify-start">
                     <Pill className="w-5 h-5 mr-3 text-emerald-500" /> Manage My Medicines
                   </Button>
                   <Button onClick={() => navigate("/app/patient/appointments")} variant="outline" className="h-auto py-4 rounded-2xl justify-start">
                     <Calendar className="w-5 h-5 mr-3 text-blue-500" /> View Appointments
                   </Button>
                </div>
              </div>
            )}

            {/* CASES TAB */}
            {activeTab === "CASES" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-heading">Current Cases</h2>
                {currentCases.length === 0 ? (
                   <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl font-medium">
                     No active cases recorded.
                   </div>
                ) : (
                  <div className="space-y-4">
                    {currentCases.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCaseId(c.id)}
                        className="bg-card border rounded-2xl p-5 hover:border-primary/40 cursor-pointer shadow-sm transition-all"
                      >
                         <div className="flex justify-between items-start gap-4">
                           <div>
                             <h3 className="font-bold text-lg">{c.title}</h3>
                             <p className="text-sm font-medium text-muted-foreground mt-0.5">{c.doctorName} • {c.organizationName}</p>
                           </div>
                           <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-700 mt-1">
                             {c.status}
                           </span>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-8">
                  <Button variant="outline" onClick={() => setActiveTab("JOURNEY")} className="w-full sm:w-auto rounded-xl">
                    View previous cases in Health Journey <History className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ALLERGIES TAB */}
            {activeTab === "ALLERGIES" && (
              <AllergySection 
                allergies={allergies}
                onAdd={handleAllergyAdd}
                onUpdate={handleAllergyUpdate}
                onDelete={handleAllergyDelete}
              />
            )}

            {/* JOURNEY TAB */}
            {activeTab === "JOURNEY" && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold font-heading mb-8">Health Journey</h2>
                <HealthJourney timeline={timeline} onItemClick={handleTimelineClick} />
              </div>
            )}

          </div>
        )}
      </div>

      <CaseDetailDrawer 
        isOpen={selectedCaseId !== null} 
        onClose={() => setSelectedCaseId(null)} 
        caseId={selectedCaseId} 
        onMedicineClick={() => navigate("/app/patient/schedule")}
        onAppointmentClick={() => navigate("/app/patient/appointments")}
      />

    </div>
  )
}
