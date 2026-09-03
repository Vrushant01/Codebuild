import type { ChatMessage, SymptomData } from "./chat-types"
import { apiClient } from "../api/apiClient"

export const mockAiService = {
  resetState() {
    // Stateless server handles state through history and currentSymptoms payload
  },

  async processUserMessage(
    messageText: string, 
    language: string,
    history: { role: string; text: string }[] = [],
    currentSymptoms?: SymptomData
  ): Promise<{ response: Omit<ChatMessage, "id" | "timestamp">; updatedSymptoms: SymptomData }> {
    try {
      const res = await apiClient.post<{
        success: boolean
        data: {
          response: { role: "assistant"; type: "text" | "question" | "summary" | "transition" | "redirection"; text: string; suggestions?: string[] }
          updatedSymptoms: SymptomData
          recommendedSpecialization?: string
          isEmergency?: boolean
        }
      }>("/chat/message", {
        message: messageText,
        language,
        history,
        currentSymptoms
      })

      if (res && res.data) {
        return {
          response: {
            role: "assistant",
            type: res.data.response.type,
            text: res.data.response.text,
            suggestions: res.data.response.suggestions
          },
          updatedSymptoms: res.data.updatedSymptoms
        }
      }
    } catch (err) {
      console.warn("⚠️ AI Service falling back to local heuristic:", err)
    }

    // Local heuristic fallback
    const isGujarati = language === "gu" || /[\u0A80-\u0AFF]/.test(messageText)
    const lower = messageText.toLowerCase()
    
    // Check emergency in local fallback
    if (lower.includes("chest pain") || lower.includes("heart") || lower.includes("breathe") || lower.includes("છાતી")) {
      return {
        response: {
          role: "assistant",
          type: "redirection",
          text: isGujarati
            ? "⚠️ તાત્કાલિક ચેતવણી: તમારા લક્ષણો ગંભીર ઈમરજન્સી તરફ નિર્દેશ કરે છે. કૃપા કરીને તરત જ ૧૦૮ અથવા ૧૧૨ પર કૉલ કરો અને નજીકની ઈમરજન્સી હોસ્પિટલમાં પહોંચો."
            : "⚠️ CRITICAL MEDICAL ALERT: Your symptoms may indicate an acute medical emergency. Please immediately call 108 / 112 or visit the nearest Hospital Emergency Room.",
          suggestions: isGujarati ? ["૧૦૮ કૉલ કરો", "ઈમરજન્સી હોસ્પિટલ"] : ["Call 108 Emergency", "Find Hospital"]
        },
        updatedSymptoms: {
          symptoms: [...(currentSymptoms?.symptoms || []), messageText],
          location: currentSymptoms?.location || "Chest / Vital",
          duration: currentSymptoms?.duration || "Acute",
          severity: "10 (Critical)",
          associatedSymptoms: currentSymptoms?.associatedSymptoms || [],
          notes: currentSymptoms?.notes || []
        }
      }
    }

    const currentList = currentSymptoms?.symptoms || []
    const updatedSymptoms: SymptomData = {
      symptoms: currentList.length === 0 ? [messageText] : currentList,
      location: currentSymptoms?.location || (currentList.length > 0 && !currentSymptoms?.location ? messageText : null),
      duration: currentSymptoms?.duration || (currentSymptoms?.location && !currentSymptoms?.duration ? messageText : null),
      severity: currentSymptoms?.severity || (currentSymptoms?.duration && !currentSymptoms?.severity ? messageText : null),
      associatedSymptoms: currentSymptoms?.associatedSymptoms || [],
      notes: currentSymptoms?.notes || []
    }

    if (!updatedSymptoms.location) {
      return {
        response: {
          role: "assistant",
          type: "question",
          text: isGujarati 
            ? "હું તમારી તકલીફ સમજી શકું છું. શરીરના કયા ભાગમાં આ દુખાવો અથવા તકલીફ વધુ થાય છે?" 
            : "I understand your concern. Where exactly in your body are you experiencing this discomfort?",
          suggestions: isGujarati ? ["માથું / ગળું", "પેટ", "છાતી / પીઠ", "સાંધા"] : ["Head / Throat", "Stomach", "Chest / Back", "Joints"]
        },
        updatedSymptoms
      }
    }

    if (!updatedSymptoms.duration) {
      return {
        response: {
          role: "assistant",
          type: "question",
          text: isGujarati 
            ? "આ લક્ષણો તમને કેટલા સમયથી અનુભવાઈ રહ્યા છે?" 
            : "How long have you been experiencing these symptoms?",
          suggestions: isGujarati ? ["આજથી જ", "૨-૩ દિવસથી", "૧ અઠવાડિયાથી વધુ"] : ["Since today", "2-3 days", "Over 1 week"]
        },
        updatedSymptoms
      }
    }

    return {
      response: {
        role: "assistant",
        type: "summary",
        text: isGujarati
          ? "તમારી માહિતી સુરક્ષિત રીતે નોંધાઈ ગઈ છે. યોગ્ય ડોક્ટરની સલાહ લેવા અને નજીકની હોસ્પિટલ જોવા નીચેના વિકલ્પો તપાસો."
          : "Your symptoms have been recorded. Based on your inputs, we recommend consulting a verified specialist on Medireach.",
        suggestions: isGujarati ? ["નજીકના ડોક્ટર શોધો", "હોસ્પિટલ જુઓ"] : ["Find Nearby Doctors", "View Hospital Map"]
      },
      updatedSymptoms
    }
  }
}

