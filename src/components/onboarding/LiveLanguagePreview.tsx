import React from "react"
import { Mic, Search, Calendar, MessageSquare } from "lucide-react"
import type { LanguageConfig } from "../../lib/i18n/language-config"

interface LiveLanguagePreviewProps {
  language: LanguageConfig
}

export function LiveLanguagePreview({ language }: LiveLanguagePreviewProps) {
  // We use key={language.id} on the animated elements to force a re-render 
  // and trigger the CSS animation when the language changes.
  
  return (
    <div className="bg-muted/30 border rounded-2xl p-6 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">+</span>
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Medireach AI
        </span>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Chat Bubble */}
        <div 
          key={`chat-${language.id}`}
          className="bg-card border shadow-sm p-4 rounded-2xl rounded-tl-sm w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <p className="text-sm">{language.preview.aiGreeting}</p>
        </div>

        {/* Input Simulation */}
        <div className="flex gap-2 w-[85%] ml-auto">
          <div className="flex-1 bg-background border rounded-full px-4 py-2 flex items-center text-sm text-muted-foreground shadow-sm">
            <span className="opacity-50">Type a message...</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
            <Mic className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap gap-2 pt-4">
          <div 
            key={`action1-${language.id}`}
            className="flex items-center gap-2 bg-background border rounded-full px-3 py-1.5 text-xs font-medium shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            {language.preview.actionFindCare}
          </div>
          <div 
            key={`action2-${language.id}`}
            className="flex items-center gap-2 bg-background border rounded-full px-3 py-1.5 text-xs font-medium shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {language.preview.actionAppointments}
          </div>
        </div>
      </div>
    </div>
  )
}
