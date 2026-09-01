import React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"
import type { LanguageConfig } from "../../lib/i18n/language-config"

interface LanguageCardProps {
  language: LanguageConfig
  isSelected: boolean
  onClick: () => void
}

export function LanguageCard({ language, isSelected, onClick }: LanguageCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start w-full p-5 text-left rounded-xl transition-all duration-300 border-2 outline-none group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm scale-[1.02]" 
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      <div className="flex justify-between w-full items-start mb-4">
        <div>
          <h3 className="text-xl font-bold font-heading">{language.nativeName}</h3>
          <p className="text-sm text-muted-foreground mt-1">{language.name}</p>
        </div>
        
        <div 
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300",
            isSelected 
              ? "bg-primary border-primary text-primary-foreground" 
              : "border-muted-foreground/30 text-transparent"
          )}
          aria-hidden="true"
        >
          <Check className="w-4 h-4" />
        </div>
      </div>
      
      <p className={cn(
        "text-sm font-medium transition-colors duration-300",
        isSelected ? "text-primary" : "text-muted-foreground"
      )}>
        Healthcare in your language
      </p>
    </button>
  )
}
