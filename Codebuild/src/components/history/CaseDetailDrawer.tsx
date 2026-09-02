import React, { useEffect, useState } from "react"
import { Activity, X, Calendar, Stethoscope, Building2, Pill, FileText, ClipboardList } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import type { MedicalCase } from "../../lib/history/medical-history-types"
import { medicalHistoryService } from "../../lib/history/medical-history-service"

interface CaseDetailDrawerProps {
  caseId: string | null
  isOpen: boolean
  onClose: () => void
  onMedicineClick?: (medicineId: string) => void
  onAppointmentClick?: (appointmentId: string) => void
}

export function CaseDetailDrawer({ caseId, isOpen, onClose, onMedicineClick, onAppointmentClick }: CaseDetailDrawerProps) {
  const [medicalCase, setMedicalCase] = useState<MedicalCase | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (caseId && isOpen) {
      setLoading(true)
      medicalHistoryService.getCaseById(caseId).then(data => {
        setMedicalCase(data)
        setLoading(false)
      })
    }
  }, [caseId, isOpen])

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed z-50 bg-background shadow-2xl transition-transform duration-300 ease-out flex flex-col",
        "lg:inset-y-0 lg:right-0 lg:w-[500px] lg:border-l",
        "inset-x-0 bottom-0 rounded-t-[2rem] lg:rounded-none max-h-[90vh] lg:max-h-none"
      )}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">Case Details</h2>
              {medicalCase && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-1",
                  medicalCase.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                  medicalCase.status === "Resolved" ? "bg-blue-100 text-blue-700" :
                  "bg-muted text-muted-foreground"
                )}>
                  {medicalCase.status}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
          {loading || !medicalCase ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-muted rounded-2xl w-full" />
              <div className="h-32 bg-muted rounded-2xl w-full" />
              <div className="h-24 bg-muted rounded-2xl w-full" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-2xl font-black">{medicalCase.title}</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Started on {medicalCase.startDate} • Last updated {medicalCase.updatedAt}
                </p>
              </div>

              {/* Context */}
              <div className="grid grid-cols-2 gap-3">
                {medicalCase.doctorName && (
                  <div className="bg-card border rounded-2xl p-3 flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                    <div className="truncate">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Doctor</p>
                      <p className="font-semibold text-sm truncate">{medicalCase.doctorName}</p>
                    </div>
                  </div>
                )}
                {medicalCase.organizationName && (
                  <div className="bg-card border rounded-2xl p-3 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div className="truncate">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Clinic</p>
                      <p className="font-semibold text-sm truncate">{medicalCase.organizationName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Clinical Details */}
              <div className="space-y-4">
                
                {medicalCase.symptoms.length > 0 && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-500 mb-2">
                      <ClipboardList className="w-4 h-4" /> Reported Symptoms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {medicalCase.symptoms.map(sym => (
                        <span key={sym} className="bg-background border rounded-lg px-2.5 py-1 text-sm font-medium shadow-sm">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {medicalCase.diagnosis && (
                  <div className="bg-card border rounded-2xl p-4 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-primary mb-2">
                      <Activity className="w-4 h-4" /> Clinical Diagnosis
                    </h4>
                    <p className="font-medium text-foreground">{medicalCase.diagnosis}</p>
                  </div>
                )}

                {medicalCase.treatment && (
                  <div className="bg-card border rounded-2xl p-4 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-primary mb-2">
                      <FileText className="w-4 h-4" /> Treatment Plan
                    </h4>
                    <p className="font-medium text-foreground">{medicalCase.treatment}</p>
                  </div>
                )}

                {medicalCase.notes && (
                  <div className="bg-muted/30 border border-dashed rounded-2xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Clinical Notes</h4>
                    <p className="text-sm font-medium text-muted-foreground italic">"{medicalCase.notes}"</p>
                  </div>
                )}
              </div>

              {/* Links */}
              {(medicalCase.appointmentId || medicalCase.medicines.length > 0) && (
                <>
                  <hr className="border-border/60" />
                  <div className="space-y-3">
                    {medicalCase.appointmentId && (
                      <Button 
                        variant="outline" 
                        onClick={() => onAppointmentClick && onAppointmentClick(medicalCase.appointmentId!)}
                        className="w-full justify-start h-auto py-3 px-4 rounded-xl font-medium"
                      >
                        <Calendar className="w-4 h-4 mr-3 text-muted-foreground" /> View related appointment
                      </Button>
                    )}
                    
                    {medicalCase.medicines.length > 0 && medicalCase.medicines.map((medId, idx) => (
                      <Button 
                        key={medId}
                        variant="outline" 
                        onClick={() => onMedicineClick && onMedicineClick(medId)}
                        className="w-full justify-start h-auto py-3 px-4 rounded-xl font-medium"
                      >
                        <Pill className="w-4 h-4 mr-3 text-emerald-500" /> View prescribed medicine {medicalCase.medicines.length > 1 ? `#${idx + 1}` : ""}
                      </Button>
                    ))}
                  </div>
                </>
              )}

            </>
          )}
        </div>
      </div>
    </>
  )
}
