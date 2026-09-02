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
          response: { role: "assistant"; type: "text" | "question" | "summary" | "transition"; text: string; suggestions?: string[] }
          updatedSymptoms: SymptomData
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
            type: (res.data.response.type === "summary" ? "transition" : res.data.response.type) as any,
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
    const isGujarati = language === "gu"
    return {
      response: {
        role: "assistant",
        type: "question",
        text: isGujarati 
          ? "તમને આ તકલીફ ક્યારથી થઈ રહી છે અને ક્યાં દુખાવો છે?" 
          : "Thank you. Where exactly are you experiencing this discomfort and since when?",
        suggestions: isGujarati ? ["આજે", "૨ દિવસથી", "માથું", "પેટ"] : ["Today", "2 days", "Head", "Stomach"]
      },
      updatedSymptoms: {
        symptoms: [messageText],
        location: null,
        duration: null,
        severity: null,
        associatedSymptoms: [],
        notes: []
      }
    }
  }
}
