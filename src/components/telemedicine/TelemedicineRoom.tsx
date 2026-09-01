import React, { useState } from "react"
import { useTelemedicine } from "../../lib/telemedicine/TelemedicineContext"
import { VideoSurfaces } from "./VideoSurfaces"
import { CallControls } from "./CallControls"
import { EndCallDialog } from "./EndCallDialog"
import { DoctorNotesPanel } from "./DoctorNotesPanel"
import { MedicinePanel } from "./MedicinePanel"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Shield, Maximize, Minimize, Info } from "lucide-react"
import { cn } from "../../lib/utils"

interface TelemedicineRoomProps {
  role: 'patient' | 'doctor'
  doctorName: string
  patientName: string
  patientId: string
}

export function TelemedicineRoom({ role, doctorName, patientName, patientId }: TelemedicineRoomProps) {
  const { durationSeconds, leaveConsultation } = useTelemedicine()
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  const isPatient = role === 'patient'

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    leaveConsultation()
    setEndDialogOpen(false)
  }

  return (
    <div className={cn(
      "flex flex-col lg:flex-row h-[calc(100vh-65px)] bg-slate-100 dark:bg-background overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 h-screen"
    )}>
      
      {/* Main Video Area */}
      <div className={cn(
        "flex-1 flex flex-col relative transition-all duration-300",
        (!isPatient && !isFullscreen) ? "lg:w-2/3 xl:w-3/4" : "w-full"
      )}>
        
        {/* Header Overlay */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10 p-4 sm:p-6 flex items-start justify-between pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-white font-bold text-lg sm:text-xl drop-shadow-md">Medireach</h1>
            <p className="text-white/90 text-sm sm:text-base font-medium drop-shadow-md">
              Video Consultation · {isPatient ? `Dr. ${doctorName}` : patientName}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs text-white/90">
                <Shield className="w-3 h-3 text-emerald-400" /> Private
              </div>
              <div className="text-white/90 text-sm font-mono bg-black/40 backdrop-blur-md px-2 py-1 rounded">
                {formatDuration(durationSeconds)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Mobile Info Toggle */}
            <Button 
              variant="secondary" 
              size="icon" 
              className="lg:hidden bg-white/10 hover:bg-white/20 text-white border-none"
              onClick={() => setShowMobilePanel(!showMobilePanel)}
            >
              <Info className="w-5 h-5" />
            </Button>

            <Button 
              variant="secondary" 
              size="icon" 
              className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white border-none"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Video Surface */}
        <div className="flex-1 p-2 sm:p-4 pb-24 sm:pb-32 bg-slate-950">
          <VideoSurfaces role={role} doctorName={doctorName} patientName={patientName} />
        </div>

        {/* Call Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/90 to-transparent z-10 flex items-end justify-center pb-6 sm:pb-8">
          <CallControls onEndCall={() => setEndDialogOpen(true)} />
        </div>
      </div>

      {/* Side Panel (Doctor Only by default, or Patient Info on mobile toggle) */}
      {!isPatient && !isFullscreen && (
        <div className={cn(
          "w-full lg:w-1/3 xl:w-1/4 h-full bg-background border-l flex flex-col transition-transform duration-300 z-20",
          showMobilePanel ? "fixed inset-0 top-[65px]" : "hidden lg:flex"
        )}>
          {/* Mobile Panel Header */}
          <div className="lg:hidden p-4 border-b flex justify-between items-center bg-card">
            <h2 className="font-bold">Consultation Panel</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowMobilePanel(false)}>Close</Button>
          </div>

          <Tabs defaultValue="notes" className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b bg-muted/20 shrink-0">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
                <TabsTrigger value="medicine">Medicine</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden p-3 sm:p-4 bg-muted/10">
              <TabsContent value="notes" className="h-full m-0 data-[state=active]:flex flex-col">
                <DoctorNotesPanel />
              </TabsContent>
              <TabsContent value="medicine" className="h-full m-0 data-[state=active]:flex flex-col">
                <MedicinePanel doctorName={doctorName} patientId={patientId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      <EndCallDialog 
        isOpen={endDialogOpen} 
        onOpenChange={setEndDialogOpen} 
        onConfirm={handleEndCall} 
      />

    </div>
  )
}
