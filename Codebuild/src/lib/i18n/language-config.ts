export type LanguageId = "en" | "gu"

export interface LanguageConfig {
  id: LanguageId
  name: string
  nativeName: string
  direction: "ltr" | "rtl"
  preview: {
    aiGreeting: string
    actionFindCare: string
    actionAppointments: string
  }
}

export const SUPPORTED_LANGUAGES: Record<LanguageId, LanguageConfig> = {
  en: {
    id: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    preview: {
      aiGreeting: "What problem are you experiencing?",
      actionFindCare: "Find healthcare near you",
      actionAppointments: "Upcoming appointment"
    }
  },
  gu: {
    id: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    direction: "ltr",
    preview: {
      aiGreeting: "તમને શું તકલીફ થઈ રહી છે?",
      actionFindCare: "તમારી નજીકની આરોગ્ય સેવા શોધો",
      actionAppointments: "આગામી મુલાકાત"
    }
  }
}

// Defaults for easy fallback
export const DEFAULT_LANGUAGE: LanguageId = "en"
