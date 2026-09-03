import React from "react"
import { Activity, User } from "lucide-react"
import type { ChatMessage as ChatMessageType } from "../../lib/chat/chat-types"
import { cn } from "../../lib/utils"

interface ChatMessageProps {
  message: ChatMessageType
  onSuggestionClick?: (text: string) => void
}

export function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const isAI = message.role === "assistant"
  const isEmergency = message.type === "redirection"

  return (
    <div className={cn(
      "flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] gap-3 md:gap-4",
        isAI ? "flex-row" : "flex-row-reverse"
      )}>
        
        {/* Avatar */}
        <div className="shrink-0 mt-auto sm:mt-1">
          <div className={cn(
            "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm",
            isAI 
              ? isEmergency 
                ? "bg-destructive/15 border border-destructive/30 text-destructive"
                : "bg-primary/10 border border-primary/20 text-primary" 
              : "bg-muted border border-border text-muted-foreground"
          )}>
            {isAI ? <Activity className="w-4 h-4 md:w-5 md:h-5" /> : <User className="w-4 h-4 md:w-5 md:h-5" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex flex-col gap-2",
          isAI ? "items-start" : "items-end"
        )}>
          
          <div className={cn(
            "px-4 md:px-5 py-3 md:py-3.5 rounded-3xl shadow-sm text-[15px] md:text-base leading-relaxed break-words whitespace-pre-line",
            isAI 
              ? isEmergency
                ? "bg-destructive/10 border border-destructive/30 rounded-bl-sm text-foreground shadow-destructive/5"
                : "bg-card border border-border rounded-bl-sm text-card-foreground" 
              : "bg-primary text-primary-foreground rounded-br-sm"
          )}>
            {message.text}
          </div>

          {/* Suggestions (Chips) */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Time (subtle, visible on hover mostly or very light) */}
          <span className="text-[10px] text-muted-foreground px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

        </div>
      </div>
    </div>
  )
}
