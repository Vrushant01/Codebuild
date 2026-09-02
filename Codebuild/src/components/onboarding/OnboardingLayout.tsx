import React from "react"
import { Activity } from "lucide-react"
import { ProgressIndicator } from "./ProgressIndicator"

interface OnboardingLayoutProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  stepTitle: string
}

export function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps,
  stepTitle
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[40%_60%] xl:grid-cols-[35%_65%]">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg font-heading font-bold">Medireach</span>
        </div>
        <ProgressIndicator current={currentStep} total={totalSteps} />
      </div>

      {/* Desktop Visual Panel */}
      <div className="hidden lg:flex relative flex-col bg-slate-900 text-white p-12 justify-between overflow-hidden">
        <div className="relative z-10 flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-xl font-heading font-bold">Medireach</span>
        </div>
        
        <div className="relative z-10 max-w-sm mt-12 mb-auto">
          <div className="space-y-4">
            <h1 className="text-4xl font-heading font-bold leading-tight">
              Your care experience should speak your language.
            </h1>
            <p className="text-slate-400 text-lg">
              We're setting up Medireach to match your preferences and needs perfectly.
            </p>
          </div>
        </div>

        {/* Abstract shapes / aesthetics */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-slate-900 to-slate-900 z-0"></div>
        <div className="absolute -left-[20%] top-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      {/* Content Panel */}
      <div className="flex flex-col relative bg-background min-h-[calc(100vh-65px)] lg:min-h-screen">
        <div className="hidden lg:block absolute top-8 right-12">
          <ProgressIndicator current={currentStep} total={totalSteps} label={stepTitle} showLabel />
        </div>
        
        <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-8 md:px-12 lg:px-24 max-w-3xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
