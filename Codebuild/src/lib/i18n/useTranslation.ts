import { useLanguage } from "./LanguageContext"
import { en } from "./locales/en"
import { gu } from "./locales/gu"
import type { LanguageId } from "./language-config"

type LocaleDictionary = typeof en

const dictionaries: Record<LanguageId, LocaleDictionary> = {
  en,
  gu
}

export function useTranslation() {
  const { currentLanguage } = useLanguage()

  const t = (key: string): string => {
    const keys = key.split(".")
    
    // Attempt to get the translation in the current language
    let current: any = dictionaries[currentLanguage]
    for (const k of keys) {
      if (current === undefined) break
      current = current[k]
    }
    
    if (typeof current === "string") {
      return current
    }

    // Fallback to English if not found
    let fallback: any = dictionaries["en"]
    for (const k of keys) {
      if (fallback === undefined) break
      fallback = fallback[k]
    }

    if (typeof fallback === "string") {
      // Development warning
      if (import.meta.env.DEV) {
        console.warn(`Translation key missing for ${currentLanguage}: ${key}`)
      }
      return fallback
    }

    // Ultimate fallback is the key itself
    return key
  }

  return { t, currentLanguage }
}
