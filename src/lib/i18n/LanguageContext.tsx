import React, { createContext, useContext, useState, useEffect } from "react"
import { DEFAULT_LANGUAGE } from "./language-config"
import type { LanguageId } from "./language-config"
import { useAuth } from "../auth/AuthContext"

interface LanguageContextType {
  currentLanguage: LanguageId
  setLanguage: (lang: LanguageId) => void
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentLanguage, setCurrentLanguage] = useState<LanguageId>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Check if user has a preference from auth state
    if (user?.language && (user.language === "en" || user.language === "gu")) {
      setCurrentLanguage(user.language as LanguageId)
    } else {
      // 2. Fallback to local storage if available
      const saved = localStorage.getItem("medireach_language") as LanguageId | null
      if (saved && (saved === "en" || saved === "gu")) {
        setCurrentLanguage(saved)
      }
    }
    setIsLoading(false)
  }, [user])

  const handleSetLanguage = (lang: LanguageId) => {
    setCurrentLanguage(lang)
    localStorage.setItem("medireach_language", lang)
    // In a real app, this would also fire an API call to sync user.language
  }

  const value = {
    currentLanguage,
    setLanguage: handleSetLanguage,
    isLoading
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
