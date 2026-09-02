import React from "react"
import { useLanguage } from "../../lib/i18n/LanguageContext"
import { SUPPORTED_LANGUAGES, type LanguageId } from "../../lib/i18n/language-config"
import { Globe } from "lucide-react"

interface LanguageSwitcherProps {
  variant?: "dropdown" | "cards"
}

export function LanguageSwitcher({ variant = "dropdown" }: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage } = useLanguage()

  if (variant === "dropdown") {
    return (
      <div className="relative group">
        <button className="flex items-center gap-1.5 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Globe className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline-block">
            {SUPPORTED_LANGUAGES[currentLanguage].nativeName}
          </span>
        </button>
        
        <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-1.5 flex flex-col gap-1">
            {Object.values(SUPPORTED_LANGUAGES).map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentLanguage === lang.id 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang.nativeName} ({lang.name})
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Cards layout for onboarding/profile
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {Object.values(SUPPORTED_LANGUAGES).map(lang => (
        <button
          key={lang.id}
          onClick={() => setLanguage(lang.id)}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${
            currentLanguage === lang.id
              ? "border-primary bg-primary/5 text-primary"
              : "border-muted-foreground/20 hover:border-primary/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="text-3xl font-heading font-bold">{lang.nativeName}</span>
          <span className="text-sm font-medium">{lang.name}</span>
          {currentLanguage === lang.id && (
            <span className="text-xs font-semibold mt-2 px-2 py-1 bg-primary/10 rounded-full">
              {lang.preview.aiGreeting}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
