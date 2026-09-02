import React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export type BookingStep = 1 | 2 | 3 | 4

interface BookingProgressIndicatorProps {
  currentStep: BookingStep
  onStepClick: (step: BookingStep) => void
  completedSteps: BookingStep[]
}

const steps = [
  { id: 1, label: "Consultation" },
  { id: 2, label: "Date & Time" },
  { id: 3, label: "Patient Details" }, 
  { id: 4, label: "Confirm" }
]

export function BookingProgressIndicator({ currentStep, onStepClick, completedSteps }: BookingProgressIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden lg:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id as BookingStep)
          const isCurrent = currentStep === step.id
          const isClickable = isCompleted || isCurrent

          return (
            <React.Fragment key={step.id}>
              <div 
                className={cn(
                  "flex items-center gap-3 transition-colors duration-300",
                  isClickable ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isClickable && onStepClick(step.id as BookingStep)}
              >
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow-sm",
                    isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                    isCompleted ? "bg-primary/90 text-primary-foreground" :
                    "bg-muted/80 text-muted-foreground border border-border"
                  )}
                >
                  {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : `0${step.id}`}
                </div>
                <span 
                  className={cn(
                    "font-medium text-sm transition-colors",
                    isCurrent ? "text-foreground font-bold" :
                    isCompleted ? "text-foreground" :
                    "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-border/50 mx-4 relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                    style={{ width: isCompleted || (isCurrent && currentStep > step.id) ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Mobile Progress */}
      <div className="lg:hidden flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-semibold text-muted-foreground">Step {currentStep} of {steps.length}</span>
          <span className="text-sm font-bold text-foreground">{steps[currentStep - 1].label}</span>
        </div>
        <div className="flex gap-1 h-1.5 w-full">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id as BookingStep)
            const isCurrent = currentStep === step.id
            return (
              <div 
                key={step.id} 
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  isCurrent ? "bg-primary" :
                  isCompleted ? "bg-primary/40" :
                  "bg-muted"
                )}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
