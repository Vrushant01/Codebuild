import React from "react"
import { Activity } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Visual / Brand Area */}
      <div className="hidden md:flex relative flex-col bg-slate-900 text-white p-10 justify-between">
        <div className="relative z-10 flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-xl font-heading font-bold">Medireach</span>
        </div>
        
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
            Healthcare, <br/>within reach.
          </h1>
          <p className="text-slate-300 text-lg">
            Join thousands of patients and providers connected through intelligent, language-inclusive care.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-slate-900 z-0"></div>
        <div className="absolute right-0 top-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-screen opacity-50 pointer-events-none"></div>
      </div>

      {/* Form Area */}
      <div className="flex flex-col p-6 md:p-12 lg:p-24 justify-center relative bg-background">
        <div className="md:hidden flex items-center gap-2 mb-8">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg font-heading font-bold">Medireach</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-heading font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
