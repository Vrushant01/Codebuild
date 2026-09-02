import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Video, PhoneCall, PhoneOff, User, Clock } from "lucide-react"
import { useAuth } from "../../lib/auth/AuthContext"
import { getSocketClient } from "../../lib/socket/socket-client"

interface IncomingCallData {
  appointmentId: string
  patientName: string
  roomId: string
  doctorName?: string
}

export function IncomingCallModal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null)

  useEffect(() => {
    if (!user) return

    const socket = getSocketClient()

    const userId = user.id || (user as any)._id
    if (userId) {
      socket.emit("join-user-channel", userId)
    }

    const handleCall = (data: IncomingCallData) => {
      console.log("📞 Received incoming consultation call:", data)
      setIncomingCall(data)
    }

    socket.on("incoming-consultation-call", handleCall)

    return () => {
      socket.off("incoming-consultation-call", handleCall)
    }
  }, [user])

  if (!incomingCall) return null

  const handleAccept = () => {
    const apptId = incomingCall.appointmentId
    setIncomingCall(null)
    navigate(`/telemedicine/${apptId}`)
  }

  const handleDecline = () => {
    setIncomingCall(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card border-2 border-primary/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing Phone/Video Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-gradient-to-tr from-primary to-teal-400 rounded-full flex items-center justify-center shadow-xl text-primary-foreground">
            <Video className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Incoming Video Consultation
          </span>
          <h2 className="text-2xl font-heading font-black text-foreground mt-3">
            {incomingCall.patientName}
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> Ready for scheduled 10:00 AM consultation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={handleDecline}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold text-sm transition-all border border-destructive/20 active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            Decline
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/25 active:scale-95 ring-2 ring-primary/40"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            Accept Call
          </button>
        </div>
      </div>
    </div>
  )
}
