import React from "react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { CalendarCheck, Clock, FileText, Pill, ArrowRight } from "lucide-react"

interface ConsultationSummaryProps {
  role: 'patient' | 'doctor'
  doctorName: string
  patientName: string
  durationSeconds: number
  onPrimaryAction: () => void
  onSecondaryAction?: () => void
}

export function ConsultationSummary({ 
  role, 
  doctorName, 
  patientName, 
  durationSeconds,
  onPrimaryAction,
  onSecondaryAction
}: ConsultationSummaryProps) {
  
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const isPatient = role === 'patient'

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-background">
      <Card className="max-w-md w-full overflow-hidden shadow-2xl border-0 ring-1 ring-border/50">
        
        <div className="bg-primary/10 p-8 text-center border-b border-primary/10">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Consultation Completed</h2>
          <p className="text-muted-foreground mt-2">
            {isPatient ? `With Dr. ${doctorName}` : `With ${patientName}`}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Duration</span>
            </div>
            <span className="font-bold text-lg">{formatDuration(durationSeconds)}</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Summary</h3>
            
            {isPatient ? (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Pill className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Prescription Updated</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your medicine schedule has been updated based on this consultation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <CalendarCheck className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Follow-up Recommended</p>
                    <p className="text-xs text-muted-foreground mt-0.5">In 10 days</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Notes Saved</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Clinical notes have been attached to the patient's record.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Pill className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Medicines Prescribed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Added to patient's active schedule.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 space-y-3">
            <Button className="w-full text-base h-12 shadow-lg shadow-primary/20" onClick={onPrimaryAction}>
              {isPatient ? "View Medicine Schedule" : "Return to Dashboard"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {onSecondaryAction && (
              <Button variant="outline" className="w-full text-base h-12" onClick={onSecondaryAction}>
                View Appointment Details
              </Button>
            )}
          </div>
        </div>

      </Card>
    </div>
  )
}
