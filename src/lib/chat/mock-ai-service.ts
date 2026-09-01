import type { ChatMessage, SymptomData } from "./chat-types"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// A very basic state machine for the mock AI to step through questions
type ConversationStage = "initial" | "location" | "duration" | "severity" | "associated" | "complete"

interface AIState {
  stage: ConversationStage
  currentSymptoms: SymptomData
}

// In-memory state for the active mock AI session
let aiState: AIState = {
  stage: "initial",
  currentSymptoms: {
    symptoms: [],
    location: null,
    duration: null,
    severity: null,
    associatedSymptoms: [],
    notes: []
  }
}

export const mockAiService = {
  resetState() {
    aiState = {
      stage: "initial",
      currentSymptoms: {
        symptoms: [],
        location: null,
        duration: null,
        severity: null,
        associatedSymptoms: [],
        notes: []
      }
    }
  },

  async processUserMessage(
    messageText: string, 
    language: string
  ): Promise<{ response: Omit<ChatMessage, "id" | "timestamp">, updatedSymptoms: SymptomData }> {
    
    await mockDelay(1500) // Simulate thinking

    const textLower = messageText.toLowerCase()
    const isGujarati = language === "gu"

    // Simple keyword extraction for the mock
    if (aiState.stage === "initial") {
      aiState.currentSymptoms.symptoms.push(messageText)
      aiState.stage = "location"
      return {
        response: {
          role: "assistant",
          type: "question",
          text: isGujarati 
            ? "તમને આ દુખાવો બરાબર ક્યાં થાય છે?" 
            : "I'm sorry you're dealing with that. Where exactly are you experiencing this?",
          suggestions: isGujarati ? ["માથું", "પેટ", "છાતી"] : ["Head", "Stomach", "Chest"]
        },
        updatedSymptoms: { ...aiState.currentSymptoms }
      }
    }

    if (aiState.stage === "location") {
      aiState.currentSymptoms.location = messageText
      aiState.stage = "duration"
      return {
        response: {
          role: "assistant",
          type: "question",
          text: isGujarati
            ? "આ તકલીફ ક્યારથી શરૂ થઈ?"
            : "How long have you been experiencing this?",
          suggestions: isGujarati ? ["આજે", "થોડા દિવસથી", "એક અઠવાડિયાથી"] : ["Today", "A few days", "Over a week"]
        },
        updatedSymptoms: { ...aiState.currentSymptoms }
      }
    }

    if (aiState.stage === "duration") {
      aiState.currentSymptoms.duration = messageText
      aiState.stage = "severity"
      return {
        response: {
          role: "assistant",
          type: "question",
          text: isGujarati
            ? "૧ થી ૧૦ ના સ્કેલ પર, આ તકલીફ કેટલી ગંભીર છે?"
            : "On a scale of 1 to 10, how severe is it?",
          suggestions: ["1", "3", "5", "7", "10"]
        },
        updatedSymptoms: { ...aiState.currentSymptoms }
      }
    }

    if (aiState.stage === "severity") {
      aiState.currentSymptoms.severity = messageText
      aiState.stage = "associated"
      return {
        response: {
          role: "assistant",
          type: "question",
          text: isGujarati
            ? "શું તમને બીજું કંઈ થઈ રહ્યું છે? (ઉદાહરણ તરીકે: તાવ, ઉબકા)"
            : "Are you experiencing any other symptoms? (e.g., fever, nausea)",
          suggestions: isGujarati ? ["તાવ", "ઉલટી", "ના, બીજું કંઈ નથી"] : ["Fever", "Nausea", "No, nothing else"]
        },
        updatedSymptoms: { ...aiState.currentSymptoms }
      }
    }

    if (aiState.stage === "associated") {
      if (!textLower.includes("no") && !textLower.includes("ના")) {
        aiState.currentSymptoms.associatedSymptoms.push(messageText)
      }
      aiState.stage = "complete"
      return {
        response: {
          role: "assistant",
          type: "transition",
          text: isGujarati
            ? "માહિતી આપવા બદલ આભાર. મેં તમારી વિગતો નોંધી લીધી છે. હવે આપણે ડૉક્ટર શોધી શકીએ છીએ."
            : "Thank you for sharing. I've organized your symptoms. Based on what you've shared, we can now look for healthcare options.",
        },
        updatedSymptoms: { ...aiState.currentSymptoms }
      }
    }

    // Default fallback
    return {
      response: {
        role: "assistant",
        type: "text",
        text: isGujarati 
          ? "તમે વધુ માહિતી આપી શકો છો." 
          : "Could you tell me a bit more about that?"
      },
      updatedSymptoms: { ...aiState.currentSymptoms }
    }
  }
}
