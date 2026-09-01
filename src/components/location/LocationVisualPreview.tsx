import React from "react"
import { Activity, MapPin, Building2, User } from "lucide-react"

export function LocationVisualPreview() {
  return (
    <div className="hidden lg:flex relative flex-col bg-slate-900 text-white p-12 justify-between overflow-hidden h-full">
      <div className="relative z-10 flex items-center gap-2">
        <Activity className="h-8 w-8 text-primary" />
        <span className="text-xl font-heading font-bold">Medireach</span>
      </div>
      
      <div className="relative z-10 max-w-sm mt-12 mb-auto">
        <div className="space-y-4">
          <h1 className="text-4xl font-heading font-bold leading-tight">
            Healthcare right where you need it.
          </h1>
          <p className="text-slate-400 text-lg">
            Discover hospitals, clinics, and specialists nearby. Location helps us connect you to local care faster.
          </p>
        </div>
      </div>

      {/* Abstract stylized map visualization */}
      <div className="absolute inset-0 z-0 opacity-40">
        {/* Network lines connecting abstract locations */}
        <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 20 60 Q 40 40 50 50 T 80 30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="1 1" />
          <path d="M 50 50 Q 60 70 80 80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="1 1" />
        </svg>

        {/* Abstract map elements positioned absolutely */}
        
        {/* YOU Marker */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-primary z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
          </div>
          <div className="mt-2 bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white border border-slate-700">
            YOU
          </div>
        </div>

        {/* Clinic Marker */}
        <div className="absolute top-[30%] left-[20%] flex flex-col items-center opacity-80 animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-1.5 flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-300">Clinic</span>
            <span className="text-[9px] text-teal-400">1.4 km</span>
          </div>
        </div>

        {/* Hospital Marker */}
        <div className="absolute top-[25%] left-[75%] flex flex-col items-center opacity-80 animate-in fade-in zoom-in duration-1000 delay-500">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-1.5 flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-300">Hospital</span>
            <span className="text-[9px] text-blue-400">2.1 km</span>
          </div>
        </div>

        {/* Doctor Marker */}
        <div className="absolute top-[75%] left-[80%] flex flex-col items-center opacity-80 animate-in fade-in zoom-in duration-1000 delay-700">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <User className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1.5 flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-300">Specialist</span>
            <span className="text-[9px] text-indigo-400">3.5 km</span>
          </div>
        </div>

      </div>

      {/* Abstract light bursts */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-slate-900 to-slate-900 z-0"></div>
      <div className="absolute -right-[20%] top-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  )
}
