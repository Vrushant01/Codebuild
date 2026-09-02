import React, { useState, useEffect } from "react"
import { Mic, MicOff, AlertCircle } from "lucide-react"
import { voiceInputService, type VoiceInputError } from "../../lib/speech/voice-service"
import { useTranslation } from "../../lib/i18n/useTranslation"
import { toast } from "react-hot-toast"

interface VoiceInputButtonProps {
  onResult: (text: string, isFinal: boolean) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export function VoiceInputButton({ onResult, isRecording, setIsRecording }: VoiceInputButtonProps) {
  const { t, currentLanguage } = useTranslation()
  const [error, setError] = useState<VoiceInputError | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceInputService.stop()
    }
  }, [])

  const handleToggle = () => {
    if (isRecording) {
      voiceInputService.stop()
      setIsRecording(false)
      return
    }

    if (!voiceInputService.isSupported()) {
      if (import.meta.env.DEV) {
        // Fallback for demo mode if browser doesn't support it
        toast.success("[Demo] Voice input simulated")
        onResult(currentLanguage === "gu" ? "મને માથાનો દુખાવો છે" : "I have a headache", true)
        return
      }
      toast.error(t("chat.voiceUnsupported"))
      return
    }

    setError(null)
    setIsRecording(true)

    voiceInputService.start({
      lang: currentLanguage,
      onResult: (text, isFinal) => {
        onResult(text, isFinal)
        if (isFinal) {
          voiceInputService.stop()
          setIsRecording(false)
        }
      },
      onError: (errType) => {
        setError(errType)
        setIsRecording(false)
        if (errType === "not-allowed") {
          toast.error(t("chat.voiceDenied"))
        } else if (errType === "not-supported") {
          toast.error(t("chat.voiceUnsupported"))
        } else if (errType !== "no-speech") {
          toast.error(t("chat.voiceError"))
        }
      },
      onEnd: () => {
        setIsRecording(false)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`p-3 rounded-full transition-all shrink-0 relative outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isRecording 
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
      aria-label={t("chat.voiceStart")}
    >
      {isRecording ? (
        <>
          <Mic className="w-5 h-5 animate-pulse" />
          <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
        </>
      ) : error ? (
        <AlertCircle className="w-5 h-5 text-destructive" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  )
}
