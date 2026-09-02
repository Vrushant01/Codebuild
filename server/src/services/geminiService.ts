import { ISymptomData } from "../models/ChatSession.js"

interface GeminiResponse {
  reply: string
  suggestions?: string[]
  type?: "question" | "summary" | "redirection"
  extractedSymptoms?: Partial<ISymptomData>
  recommendedSpecialization?: string
}

export const processChatMessageWithGemini = async (
  conversationHistory: { role: string; text: string }[],
  userMessage: string,
  language: string = "en",
  currentSymptoms: ISymptomData
): Promise<GeminiResponse> => {
  const apiKey = process.env.GEMINI_API_KEY
  const isGujarati = language === "gu" || /[\u0A80-\u0AFF]/.test(userMessage)

  if (apiKey) {
    try {
      const systemPrompt = `You are an empathetic, clinical AI triage and healthcare assistant for Medireach.
The user is speaking in ${isGujarati ? "Gujarati (ગુજરાતી)" : "English"}.
Your job is to:
1. Conduct an empathetic, step-by-step symptom intake: ask about primary symptoms, exact body location, duration, severity (1-10 scale), and associated symptoms.
2. Formulate helpful next-step suggestions (3 short quick-reply buttons).
3. Identify the relevant medical specialization needed (e.g., General Physician, Cardiologist, Dermatologist, Orthopedic, ENT, Pediatrician, Gynecologist).
4. Always output your response in valid JSON matching this schema:
{
  "reply": "Your response to the patient in the requested language",
  "suggestions": ["Option 1", "Option 2", "Option 3"],
  "type": "question" | "summary" | "redirection",
  "extractedSymptoms": {
    "symptoms": ["list of symptoms detected"],
    "location": "body location if mentioned",
    "duration": "duration if mentioned",
    "severity": "severity 1-10 or description if mentioned",
    "associatedSymptoms": ["associated symptoms"]
  },
  "recommendedSpecialization": "Specialist name or null"
}
Do not prescribe prescription-only medicines or provide definite diagnoses; advise consulting a verified doctor on the platform.`

      const contents = [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        ...conversationHistory.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }]
        })),
        {
          role: "user",
          parts: [{ text: `User message: "${userMessage}". Current collected symptoms: ${JSON.stringify(currentSymptoms)}` }]
        }
      ]

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      })

      if (res.ok) {
        const data = await res.json()
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (textOutput) {
          const parsed = JSON.parse(textOutput) as GeminiResponse
          return parsed
        }
      }
    } catch (err: any) {
      console.warn("⚠️ Gemini API call error, falling back to intelligent medical triage engine:", err.message)
    }
  }

  // Intelligent fallback engine when API key is not set or network fails
  return fallbackMedicalTriage(userMessage, language, currentSymptoms)
}

function fallbackMedicalTriage(
  message: string,
  language: string,
  current: ISymptomData
): GeminiResponse {
  const isGujarati = language === "gu" || /[\u0A80-\u0AFF]/.test(message)
  const lower = message.toLowerCase()

  // Track symptoms
  const updatedSymptoms: ISymptomData = {
    symptoms: [...(current.symptoms || [])],
    location: current.location || null,
    duration: current.duration || null,
    severity: current.severity || null,
    associatedSymptoms: [...(current.associatedSymptoms || [])],
    notes: [...(current.notes || [])]
  }

  // Stage 1: Initial symptoms
  if (updatedSymptoms.symptoms.length === 0) {
    updatedSymptoms.symptoms.push(message)
    let specialization = "General Physician"
    if (lower.includes("chest") || lower.includes("heart") || lower.includes("છાતી")) specialization = "Cardiologist"
    else if (lower.includes("skin") || lower.includes("rash") || lower.includes("ચામડી")) specialization = "Dermatologist"
    else if (lower.includes("bone") || lower.includes("knee") || lower.includes("સાંધા")) specialization = "Orthopedic"
    else if (lower.includes("ear") || lower.includes("throat") || lower.includes("ગળું")) specialization = "ENT"
    else if (lower.includes("child") || lower.includes("baby") || lower.includes("બાળક")) specialization = "Pediatrician"

    return {
      reply: isGujarati 
        ? "હું તમારી તકલીફ સમજી શકું છું. તમને આ દુખાવો અથવા તકલીફ શરીરના કયા ભાગમાં વધુ થાય છે?" 
        : "I understand your concern. Where exactly in your body are you experiencing this discomfort?",
      suggestions: isGujarati ? ["માથું / મસ્તક", "પેટ", "છાતી / પીઠ", "ગળું"] : ["Head", "Stomach", "Chest", "Throat"],
      type: "question",
      extractedSymptoms: updatedSymptoms,
      recommendedSpecialization: specialization
    }
  }

  // Stage 2: Location
  if (!updatedSymptoms.location) {
    updatedSymptoms.location = message
    return {
      reply: isGujarati
        ? "સમજાયું. આ લક્ષણો કેટલા સમયથી છે?"
        : "Thank you for clarifying. How long have you been experiencing these symptoms?",
      suggestions: isGujarati ? ["આજથી જ", "૨-૩ દિવસથી", "૧ અઠવાડિયાથી વધુ"] : ["Since today", "2-3 days", "Over a week"],
      type: "question",
      extractedSymptoms: updatedSymptoms
    }
  }

  // Stage 3: Duration
  if (!updatedSymptoms.duration) {
    updatedSymptoms.duration = message
    return {
      reply: isGujarati
        ? "૧ થી ૧૦ ના સ્કેલ પર, આ તકલીફ કેટલી તીવ્ર (ગંભીર) લાગે છે?"
        : "On a scale of 1 to 10 (1 being mild, 10 being severe), how intense is the pain or discomfort?",
      suggestions: ["2 (Mild)", "5 (Moderate)", "8 (Severe)", "10 (Critical)"],
      type: "question",
      extractedSymptoms: updatedSymptoms
    }
  }

  // Stage 4: Severity & Summary
  if (!updatedSymptoms.severity) {
    updatedSymptoms.severity = message
    return {
      reply: isGujarati
        ? "શું તમને આ સિવાય કોઈ અન્ય લક્ષણો જેવા કે તાવ, ઉબકા, કે ચક્કર આવે છે?"
        : "Are you experiencing any other symptoms, such as fever, dizziness, or nausea?",
      suggestions: isGujarati ? ["તાવ છે", "ચક્કર આવે છે", "બીજું કંઈ નથી"] : ["Mild fever", "Dizziness", "No other symptoms"],
      type: "question",
      extractedSymptoms: updatedSymptoms
    }
  }

  // Final summary and transition to discovery
  return {
    reply: isGujarati
      ? "તમારી માહિતી સુરક્ષિત રીતે નોંધાઈ ગઈ છે. તમારી સ્થિતિ માટે યોગ્ય નજીકના ડોક્ટર અથવા હોસ્પિટલની યાદી નીચે ઉપલબ્ધ છે."
      : "Thank you. Your symptom profile has been summarized. Based on your inputs, we recommend consulting a specialist. You can now view nearby available doctors and clinics on the interactive map.",
    suggestions: isGujarati ? ["નજીકની હોસ્પિટલ જુઓ", "ડોક્ટર પસંદ કરો", "ઓનલાઇન કન્સલ્ટેશન"] : ["Find Nearby Hospitals", "Select Doctor", "Book Telemedicine"],
    type: "summary",
    extractedSymptoms: updatedSymptoms,
    recommendedSpecialization: "General Physician"
  }
}
