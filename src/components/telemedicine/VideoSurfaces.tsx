import React from "react"
import { useTelemedicine } from "../../lib/telemedicine/TelemedicineContext"
import { cn } from "../../lib/utils"
import { MicOff, VideoOff, WifiOff } from "lucide-react"

interface VideoSurfacesProps {
  role: 'patient' | 'doctor'
  doctorName: string
  patientName: string
}

export function VideoSurfaces({ role, doctorName, patientName }: VideoSurfacesProps) {
  const { status, devices, connectionInfo } = useTelemedicine()

  const isPatient = role === 'patient'
  
  // Primary Video (The other person)
  const primaryName = isPatient ? `Dr. ${doctorName}` : patientName
  // Secondary Video (Self)
  const secondaryName = isPatient ? patientName : `Dr. ${doctorName}`

  const isReconnecting = status === "RECONNECTING"

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
      
      {/* Primary Video Surface (Mock) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Simulate the remote user's camera being OFF for mock purposes if we are the doctor, 
            or always show a placeholder since we don't have real WebRTC */}
        <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-slate-700/50">
          <span className="text-4xl text-slate-400 font-bold">{primaryName.charAt(0)}</span>
        </div>
        <p className="text-white/80 font-medium text-lg drop-shadow-md">{primaryName}</p>
        
        {/* Reconnecting Overlay */}
        {isReconnecting && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in">
            <WifiOff className="w-12 h-12 text-white/50 mb-4 animate-pulse" />
            <p className="text-white font-medium text-lg">Connection interrupted</p>
            <p className="text-white/70 text-sm mt-1">Trying to reconnect...</p>
          </div>
        )}
      </div>

      {/* Secondary Video Surface (Self PIP) */}
      <div className={cn(
        "absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-24 h-36 sm:w-36 sm:h-48 bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-2 transition-colors z-20",
        devices.cameraEnabled ? "border-slate-700" : "border-slate-800"
      )}>
        {devices.cameraEnabled ? (
          // Mock active camera
          <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
               <span className="text-xl text-white/80">{secondaryName.charAt(0)}</span>
            </div>
            {!devices.microphoneEnabled && (
              <div className="absolute bottom-2 right-2 bg-destructive/90 rounded-md p-1 backdrop-blur-sm">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ) : (
          // Camera Off State
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
            <VideoOff className="w-6 h-6 text-slate-500 mb-2" />
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium px-2 text-center">Camera off</span>
          </div>
        )}
      </div>

      {/* Connection Quality Indicator (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
        <div className={cn(
          "w-2 h-2 rounded-full",
          connectionInfo.status === 'good' ? "bg-emerald-500" :
          connectionInfo.status === 'fair' ? "bg-amber-500" :
          "bg-destructive"
        )} />
        <span className="text-white/90 text-xs font-medium">
          {isReconnecting ? 'Reconnecting...' : 'Connected'}
        </span>
      </div>

    </div>
  )
}
