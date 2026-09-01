import React, { useState, useRef } from "react"
import { Send } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "../../lib/i18n/useTranslation"
import { VoiceInputButton } from "./VoiceInputButton"
import { cn } from "../../lib/utils"

interface ChatComposerProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const { t } = useTranslation()
  const [text, setText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText("")
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceResult = (transcript: string, isFinal: boolean) => {
    if (isFinal) {
      setText(prev => prev ? `${prev} ${transcript}` : transcript)
    } else {
      setText(prev => prev ? `${prev} ${transcript}` : transcript) // Just append for now, user can edit
    }
  }

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="bg-background border-t p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col gap-2">
      <div className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-3xl border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
        
        <VoiceInputButton 
          onResult={handleVoiceResult}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />

        <textarea
          ref={inputRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isRecording}
          placeholder={isRecording ? t("chat.voiceListening") : t("chat.placeholder")}
          className="flex-1 bg-transparent resize-none py-2 sm:py-3 px-2 max-h-[120px] focus:outline-none placeholder:text-muted-foreground/60 text-sm sm:text-base leading-relaxed disabled:opacity-50"
          rows={1}
          style={{ height: 'auto', minHeight: '44px' }}
        />

        <Button
          size="icon"
          disabled={!text.trim() || disabled || isRecording}
          onClick={handleSend}
          className={cn(
            "shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-all",
            text.trim() && !disabled && !isRecording ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground opacity-50"
          )}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      <div className="text-center text-[10px] sm:text-xs text-muted-foreground mt-2 px-4 opacity-70">
        {t("chat.disclaimer")}
      </div>
    </div>
  )
}
