import React, { useState } from "react"
import { useTelemedicine } from "../../lib/telemedicine/TelemedicineContext"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Video, Mic, Volume2, VideoOff, MicOff, VolumeX, Settings, CheckCircle2 } from "lucide-react"

interface PreCallCheckProps {
  onJoin: () => void
  doctorName: string
  appointmentTime: string
  consultationType: string
}

export function PreCallCheck({ onJoin, doctorName, appointmentTime, consultationType }: PreCallCheckProps) {
  const { devices, toggleCamera, toggleMicrophone, toggleSpeaker } = useTelemedicine()
  const [testingSpeaker, setTestingSpeaker] = useState(false)

  const handleTestSpeaker = () => {
    setTestingSpeaker(true)
    setTimeout(() => setTestingSpeaker(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-65px)] flex flex-col justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-heading font-bold mb-2">Ready to join?</h1>
        <p className="text-muted-foreground">
          {consultationType} with {doctorName} at {appointmentTime}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Camera Preview */}
        <div className="rounded-2xl overflow-hidden bg-black aspect-video relative shadow-xl flex items-center justify-center">
          {devices.cameraEnabled ? (
            <div className="text-white text-center">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Camera Preview</p>
            </div>
          ) : (
            <div className="text-white/50 text-center">
              <VideoOff className="w-12 h-12 mx-auto mb-4" />
              <p className="font-medium">Camera is off</p>
            </div>
          )}

          {/* Floating Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              variant={devices.microphoneEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleMicrophone}
            >
              {devices.microphoneEnabled ? <Mic /> : <MicOff />}
            </Button>
            <Button
              variant={devices.cameraEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleCamera}
            >
              {devices.cameraEnabled ? <Video /> : <VideoOff />}
            </Button>
          </div>
        </div>

        {/* Device Settings */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" /> Device Check
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-background">
                  {devices.cameraEnabled ? <Video className="w-4 h-4 text-primary" /> : <VideoOff className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-medium text-sm">Camera</p>
                  <p className="text-xs text-muted-foreground">{devices.cameraEnabled ? 'Ready' : 'Off'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-background">
                  {devices.microphoneEnabled ? <Mic className="w-4 h-4 text-primary" /> : <MicOff className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-medium text-sm">Microphone</p>
                  <p className="text-xs text-muted-foreground">{devices.microphoneEnabled ? 'Ready' : 'Muted'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-background">
                  {devices.speakerEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-medium text-sm">Speaker</p>
                  <p className="text-xs text-muted-foreground">
                    {testingSpeaker ? 'Playing sound...' : 'Ready'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleTestSpeaker} disabled={testingSpeaker || !devices.speakerEnabled}>
                Test
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-primary/5 text-primary p-4 rounded-lg mb-6 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Preparation Checklist</p>
                <ul className="mt-1 space-y-1 text-primary/80">
                  <li>✓ Stable internet connection</li>
                  <li>✓ Quiet, private space</li>
                </ul>
              </div>
            </div>

            <Button className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20" onClick={onJoin}>
              Enter Consultation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
