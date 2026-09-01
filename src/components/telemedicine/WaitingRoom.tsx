import React from "react"
import { useTelemedicine } from "../../lib/telemedicine/TelemedicineContext"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Loader2, PhoneMissed, Video } from "lucide-react"

interface WaitingRoomProps {
  doctorName: string
  appointmentTime: string
  role: 'patient' | 'doctor'
  patientName?: string
  onStartDoctor?: () => void
  onLeave: () => void
}

export function WaitingRoom({ doctorName, appointmentTime, role, patientName, onStartDoctor, onLeave }: WaitingRoomProps) {
  const { status } = useTelemedicine()

  const isConnecting = status === "CONNECTING"

  if (role === 'doctor') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-65px)]">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Video className="w-10 h-10 text-primary" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Patient is waiting</h2>
            <p className="text-muted-foreground">{patientName} is in the waiting room for the {appointmentTime} consultation.</p>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              className="w-full text-lg h-14" 
              onClick={onStartDoctor}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...
                </>
              ) : (
                "Start Consultation"
              )}
            </Button>
            <Button variant="ghost" className="w-full" onClick={onLeave}>
              Leave
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Patient view
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-65px)]">
      <Card className="max-w-md w-full p-8 text-center relative overflow-hidden">
        {/* Subtle animated background for waiting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
              <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-background shadow-xl">
                <span className="text-3xl font-bold text-primary">{doctorName.charAt(0) || 'D'}</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold">Dr. {doctorName}</h2>
              <p className="text-sm text-muted-foreground">Video Consultation · {appointmentTime}</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
            {isConnecting ? (
              <>
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="font-medium">Connecting to doctor...</p>
              </>
            ) : (
              <>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="font-medium">Waiting for your doctor...</p>
                <p className="text-xs text-muted-foreground">Your consultation will begin automatically when the doctor joins.</p>
              </>
            )}
          </div>

          <Button variant="ghost" className="text-muted-foreground" onClick={onLeave}>
            <PhoneMissed className="w-4 h-4 mr-2" /> Cancel & Leave
          </Button>
        </div>
      </Card>
    </div>
  )
}
