import React, { useEffect, useRef } from "react"
import type { ChatMessage as ChatMessageType } from "../../lib/chat/chat-types"
import { ChatMessage } from "./ChatMessage"
import { Activity } from "lucide-react"
import { useTranslation } from "../../lib/i18n/useTranslation"

interface ChatMessageListProps {
  messages: ChatMessageType[]
  isTyping: boolean
  onSuggestionClick: (text: string) => void
}

export function ChatMessageList({ messages, isTyping, onSuggestionClick }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    // Smooth scroll to bottom when new messages arrive or typing status changes
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 md:gap-8 scroll-smooth">
      
      {messages.length === 0 && !isTyping && (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 shadow-sm">
            <Activity className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-heading font-bold text-foreground">{t("chat.title")}</h3>
            <p className="text-muted-foreground">
              {t("chat.welcome")}
            </p>
          </div>
          
          {/* Quick starter chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[t("chat.prompts.fever"), t("chat.prompts.headache"), t("chat.prompts.needDoctor"), t("chat.prompts.findHospital")].map(text => (
              <button
                key={text}
                onClick={() => onSuggestionClick(text)}
                className="px-4 py-2.5 bg-card border hover:border-primary/50 rounded-full text-sm font-medium transition-colors shadow-sm"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage 
          key={msg.id} 
          message={msg} 
          onSuggestionClick={onSuggestionClick}
        />
      ))}

      {isTyping && (
        <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2">
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Activity className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
            <div className="bg-card border border-border px-5 py-4 rounded-3xl rounded-bl-sm flex items-center gap-1.5 h-12">
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Invisible element to scroll to */}
      <div ref={bottomRef} className="h-4" />
    </div>
  )
}
