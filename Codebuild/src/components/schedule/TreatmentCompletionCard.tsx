import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, AlertCircle, CalendarClock, Phone } from "lucide-react"
import { Button } from "../ui/button"

interface TreatmentCompletionCardProps {
  onDismiss: () => void
}

export function TreatmentCompletionCard({ onDismiss }: TreatmentCompletionCardProps) {
  const navigate = useNavigate()
  const [feedbackState, setFeedbackState] = useState<"initial" | "better" | "sick">("initial")

  const handleFollowUp = () => {
    // Navigate to appointment discovery/booking (Prompt 8 handoff)
    navigate("/app/patient/map")
  }

  return (
    <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm text-center animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto my-8">
      
      {feedbackState === "initial" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Treatment completed</h2>
          <p className="text-muted-foreground mb-8">
            You've completed your prescribed medication course. How are you feeling now?
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setFeedbackState("better")}
            >
              Feeling better
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
              onClick={() => setFeedbackState("sick")}
            >
              Still feeling sick
            </Button>
          </div>
        </>
      )}

      {feedbackState === "better" && (
        <div className="animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-heading font-bold mb-2">That's great news!</h2>
          <p className="text-muted-foreground mb-8">
            Your treatment record has been saved to your medical history. Stay healthy!
          </p>
          <Button variant="outline" onClick={onDismiss}>Dismiss</Button>
        </div>
      )}

      {feedbackState === "sick" && (
        <div className="animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-heading font-bold mb-2">We're here to help</h2>
          <p className="text-muted-foreground mb-8 text-sm max-w-sm mx-auto">
            If your symptoms persist after completing the medication course, please consult a healthcare professional.
          </p>
          
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button onClick={handleFollowUp} className="gap-2">
              <CalendarClock className="w-4 h-4" /> Request follow-up appointment
            </Button>
            <Button variant="outline" className="gap-2 text-primary">
              <Phone className="w-4 h-4" /> Contact Doctor
            </Button>
            <Button variant="ghost" onClick={onDismiss} className="mt-2 text-muted-foreground">
              Maybe later
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
