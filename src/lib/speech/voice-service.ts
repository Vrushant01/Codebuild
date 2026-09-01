// Browser speech recognition API types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export type VoiceInputError = "not-supported" | "not-allowed" | "no-speech" | "network" | "unknown"

export interface VoiceInputOptions {
  lang: string
  onResult: (text: string, isFinal: boolean) => void
  onError: (error: VoiceInputError, message?: string) => void
  onEnd: () => void
}

class VoiceInputService {
  private recognition: any = null
  private isListening = false
  
  constructor() {
    this.initRecognition()
  }

  private initRecognition() {
    if (typeof window === "undefined") return
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
    }
  }

  isSupported(): boolean {
    return !!this.recognition
  }

  start(options: VoiceInputOptions) {
    if (!this.isSupported()) {
      options.onError("not-supported")
      return
    }

    if (this.isListening) {
      this.stop()
    }

    // Set recognition language. Use specific locales.
    this.recognition.lang = options.lang === "gu" ? "gu-IN" : "en-IN"

    this.recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      const isFinal = finalTranscript.length > 0 && interimTranscript.length === 0
      const text = isFinal ? finalTranscript : interimTranscript
      
      if (text.trim().length > 0) {
        options.onResult(text, isFinal)
      }
    }

    this.recognition.onerror = (event: any) => {
      let errorType: VoiceInputError = "unknown"
      
      if (event.error === "not-allowed") errorType = "not-allowed"
      if (event.error === "no-speech") errorType = "no-speech"
      if (event.error === "network") errorType = "network"
      
      options.onError(errorType, event.message)
      this.isListening = false
    }

    this.recognition.onend = () => {
      this.isListening = false
      options.onEnd()
    }

    try {
      this.recognition.start()
      this.isListening = true
    } catch (e) {
      // Handle cases where it might already be started
      console.error("Speech recognition error:", e)
      options.onError("unknown")
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }
}

export const voiceInputService = new VoiceInputService()
