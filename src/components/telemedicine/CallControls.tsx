import React from "react"
import { useTelemedicine } from "../../lib/telemedicine/TelemedicineContext"
import { Button } from "../ui/button"
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, PhoneOff, MoreVertical } from "lucide-react"
import { cn } from "../../lib/utils"

interface CallControlsProps {
  onEndCall: () => void
}

export function CallControls({ onEndCall }: CallControlsProps) {
  const { devices, toggleCamera, toggleMicrophone, toggleSpeaker } = useTelemedicine()

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-md mx-auto">
      
      <Button
        variant={devices.microphoneEnabled ? "secondary" : "destructive"}
        size="icon"
        className={cn(
          "rounded-full h-12 w-12 sm:h-14 sm:w-14 transition-colors shadow-lg",
          devices.microphoneEnabled ? "bg-white/10 hover:bg-white/20 text-white border-none" : ""
        )}
        onClick={toggleMicrophone}
        aria-label={devices.microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {devices.microphoneEnabled ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
      </Button>

      <Button
        variant={devices.cameraEnabled ? "secondary" : "destructive"}
        size="icon"
        className={cn(
          "rounded-full h-12 w-12 sm:h-14 sm:w-14 transition-colors shadow-lg",
          devices.cameraEnabled ? "bg-white/10 hover:bg-white/20 text-white border-none" : ""
        )}
        onClick={toggleCamera}
        aria-label={devices.cameraEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {devices.cameraEnabled ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "rounded-full h-12 w-12 sm:h-14 sm:w-14 transition-colors shadow-lg",
          devices.speakerEnabled ? "bg-white/10 hover:bg-white/20 text-white border-none" : "bg-white/5 hover:bg-white/10 text-white/50 border-none"
        )}
        onClick={toggleSpeaker}
        aria-label={devices.speakerEnabled ? "Turn off speaker" : "Turn on speaker"}
      >
        {devices.speakerEnabled ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
      </Button>

      {/* End Call Button */}
      <Button
        variant="destructive"
        className="rounded-full h-12 sm:h-14 px-6 sm:px-8 font-semibold shadow-lg shadow-destructive/20 ml-2"
        onClick={onEndCall}
        aria-label="End consultation"
      >
        <PhoneOff className="w-5 h-5 sm:mr-2" />
        <span className="hidden sm:inline">End</span>
      </Button>

    </div>
  )
}
