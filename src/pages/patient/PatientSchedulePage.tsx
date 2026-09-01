import React, { useState, useEffect, useMemo } from "react"
import { NextMedicineWidget } from "../../components/schedule/NextMedicineWidget"
import { MedicineTimeline } from "../../components/schedule/MedicineTimeline"
import { AddMedicineModal } from "../../components/schedule/AddMedicineModal"
import { MedicineDetailDrawer } from "../../components/schedule/MedicineDetailDrawer"
import { PersistentSymptomsPrompt } from "../../components/schedule/PersistentSymptomsPrompt"
import { scheduleService } from "../../lib/schedule/schedule-service"
import type { DailySchedule, Dose, Medicine } from "../../lib/schedule/schedule-types"
import { Plus, Pill, Calendar as CalendarIcon, History, Search } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"
import { MedicineCard } from "../../components/schedule/MedicineCard"

type Tab = "TODAY" | "UPCOMING" | "HISTORY"

export default function PatientSchedulePage() {
  const [activeTab, setActiveTab] = useState<Tab>("TODAY")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [schedule, setSchedule] = useState<DailySchedule | null>(null)
  const [upcomingDose, setUpcomingDose] = useState<(Dose & { medicine: Medicine }) | null>(null)
  
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([])
  const [historyMedicines, setHistoryMedicines] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [daily, upcoming, allMeds, historyMeds] = await Promise.all([
        scheduleService.getDailySchedule(selectedDate),
        scheduleService.getUpcomingDose(selectedDate),
        scheduleService.getMedicines(),
        scheduleService.getMedicineHistory()
      ])
      setSchedule(daily)
      setUpcomingDose(upcoming)
      setAllMedicines(allMeds)
      setHistoryMedicines(historyMeds)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const handleMarkTaken = async (id: string) => {
    await scheduleService.markDoseTaken(id)
    await loadData()
  }

  const handleUpdate = async () => {
    await loadData()
  }

  const filteredUpcoming = useMemo(() => {
    return allMedicines.filter(m => 
       m.status === "active" && 
       m.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allMedicines, searchQuery])

  const filteredHistory = useMemo(() => {
    return historyMedicines.filter(m => 
       m.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [historyMedicines, searchQuery])

  // Check if any medication has been completed recently to trigger PersistentSymptomsPrompt
  const hasCompletedCourse = historyMedicines.some(m => m.status === "completed")

  return (
    <div className="min-h-[calc(100vh-65px)] bg-background pb-24 lg:pb-0">
      
      {/* Header */}
      <div className="bg-card border-b px-4 py-6 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-black">Medicine Schedule</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Keep track of your medicines and daily instructions.</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-md w-full sm:w-auto rounded-xl">
              <Plus className="w-4 h-4" /> Add medicine
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-8 overflow-x-auto no-scrollbar border-b">
            <button 
              onClick={() => setActiveTab("TODAY")}
              className={cn("px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2", activeTab === "TODAY" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Today's Routine
            </button>
            <button 
              onClick={() => setActiveTab("UPCOMING")}
              className={cn("px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2", activeTab === "UPCOMING" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Active Medicines
            </button>
            <button 
              onClick={() => setActiveTab("HISTORY")}
              className={cn("px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2", activeTab === "HISTORY" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-muted rounded-2xl w-full" />
            <div className="h-64 bg-muted rounded-2xl w-full" />
          </div>
        ) : (
          <>
            {/* TODAY TAB */}
            {activeTab === "TODAY" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* Hero Summary & Next */}
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex-1 flex flex-col justify-center">
                    <p className="text-primary font-bold uppercase tracking-wider text-xs mb-2">Today's Overview</p>
                    <h2 className="text-3xl font-black">{schedule?.totalCount || 0} <span className="text-lg font-medium text-muted-foreground">medicines</span></h2>
                    <p className="text-sm font-medium mt-1 text-muted-foreground">
                      {schedule?.completedCount || 0} taken • {(schedule?.totalCount || 0) - (schedule?.completedCount || 0)} upcoming
                    </p>
                  </div>
                  <div className="lg:w-[400px]">
                    {upcomingDose ? (
                      <NextMedicineWidget dose={upcomingDose} />
                    ) : (
                      <div className="bg-card border rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center">
                        <Pill className="w-8 h-8 text-muted-foreground/30 mb-3" />
                        <p className="font-bold">No upcoming doses</p>
                        <p className="text-xs text-muted-foreground mt-1">You're all caught up for now.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2 mb-8">
                    <CalendarIcon className="w-5 h-5 text-primary" /> Today's Timeline
                  </h3>
                  {schedule && (
                    <MedicineTimeline 
                      doses={schedule.doses} 
                      onMarkTaken={handleMarkTaken} 
                      onMedicineClick={setSelectedMedicine}
                    />
                  )}
                </div>

                {hasCompletedCourse && <PersistentSymptomsPrompt />}
              </div>
            )}

            {/* UPCOMING / HISTORY TABS */}
            {(activeTab === "UPCOMING" || activeTab === "HISTORY") && (
              <div className="animate-in fade-in space-y-6">
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Search medicine name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-card border rounded-xl pl-11 pr-4 py-3 font-medium text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-4">
                  {(activeTab === "UPCOMING" ? filteredUpcoming : filteredHistory).length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed rounded-3xl">
                      <p className="font-bold text-muted-foreground">No medicines found.</p>
                    </div>
                  ) : (
                    (activeTab === "UPCOMING" ? filteredUpcoming : filteredHistory).map(med => (
                      <div 
                        key={med.id} 
                        onClick={() => setSelectedMedicine(med)}
                        className="bg-card border hover:border-primary/40 rounded-2xl p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                      >
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h4 className="font-bold text-lg">{med.name}</h4>
                               <span className={cn(
                                 "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                 med.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                 med.status === "cancelled" ? "bg-muted text-muted-foreground" :
                                 "bg-blue-100 text-blue-700"
                               )}>
                                 {med.status}
                               </span>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                               {med.dosage} • {med.frequency} • {med.foodInstruction}
                            </p>
                         </div>
                         <div className="text-left sm:text-right">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Duration</p>
                            <p className="text-sm font-medium">{med.startDate} {med.endDate ? `to ${med.endDate}` : "onwards"}</p>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddMedicineModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleUpdate}
      />

      <MedicineDetailDrawer 
        isOpen={selectedMedicine !== null}
        onClose={() => setSelectedMedicine(null)}
        medicine={selectedMedicine}
        onUpdate={handleUpdate}
      />

    </div>
  )
}
