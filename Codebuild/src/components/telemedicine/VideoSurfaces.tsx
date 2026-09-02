import React, { useEffect, useRef } from "react"
import { useTelemedicine } from "../../lib/telemedicine/TelemedicineContext"
import { telemedicineService } from "../../lib/telemedicine/telemedicine-service"
import { cn } from "../../lib/utils"
import { MicOff, VideoOff, WifiOff, ShieldCheck, Volume2 } from "lucide-react"

interface VideoSurfacesProps {
  role: 'patient' | 'doctor'
  doctorName: string
  patientName: string
}

export function VideoSurfaces({ role, doctorName, patientName }: VideoSurfacesProps) {
  const { status, devices, connectionInfo } = useTelemedicine()

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const isPatient = role === 'patient'
  const primaryName = isPatient ? `Dr. ${doctorName}` : patientName
  const secondaryName = isPatient ? patientName : `Dr. ${doctorName}`

  const isReconnecting = status === "RECONNECTING"

  useEffect(() => {
    const unsubscribe = telemedicineService.onStreamChange((localStream, remoteStream) => {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream
      }
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border border-slate-800/80">
      
      {/* Primary Video Surface (Remote User / Active Consultant) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Remote User Placeholder if camera stream not active yet */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-slate-950/40 backdrop-blur-xs">
          <div className="relative w-36 h-36 bg-gradient-to-br from-teal-500/20 to-primary/40 rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-primary/40 animate-pulse">
            <span className="text-5xl text-white font-heading font-black">{primaryName.charAt(0)}</span>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-7 h-7 rounded-full border-4 border-slate-950 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
          </div>
          <p className="text-white font-bold text-xl drop-shadow-md tracking-tight">{primaryName}</p>
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider mt-1">Live Consultation Active</p>
        </div>
        
        {/* Reconnecting Overlay */}
        {isReconnecting && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-30 animate-in fade-in">
            <WifiOff className="w-14 h-14 text-amber-400 mb-4 animate-bounce" />
            <p className="text-white font-bold text-xl">Connection Interrupted</p>
            <p className="text-white/70 text-sm mt-1">Reconnecting to secure medical channel...</p>
          </div>
        )}
      </div>

      {/* Secondary Video Surface (Self PIP - Picture In Picture) */}
      <div className={cn(
        "absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-32 h-44 sm:w-44 sm:h-56 bg-slate-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border-2 transition-all z-20",
        devices.cameraEnabled ? "border-primary/60 ring-4 ring-primary/10 shadow-primary/20" : "border-slate-800"
      )}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={cn("w-full h-full object-cover", !devices.cameraEnabled && "hidden")}
        />

        {!devices.cameraEnabled && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2">
            <VideoOff className="w-8 h-8 text-slate-500 mb-2" />
            <span className="text-[11px] font-bold text-slate-400 text-center">Camera Off</span>
          </div>
        )}

        {/* Local Mic Mute Indicator */}
        {!devices.microphoneEnabled && (
          <div className="absolute bottom-2 right-2 bg-destructive text-white rounded-lg p-1.5 shadow-lg backdrop-blur-sm">
            <MicOff className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Self Label */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white/90">
          You ({secondaryName.split(" ")[0]})
        </div>
      </div>

      {/* Connection Quality & Encryption Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
        <div className={cn(
          "w-2.5 h-2.5 rounded-full shadow-sm",
          connectionInfo.status === 'good' ? "bg-emerald-500 animate-pulse" :
          connectionInfo.status === 'fair' ? "bg-amber-500" :
          "bg-destructive"
        )} />
        <span className="text-white text-xs font-bold tracking-tight">
          {isReconnecting ? 'Reconnecting...' : 'HD 1080p • Encrypted'}
        </span>
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
      </div>

    </div>
  )
}
