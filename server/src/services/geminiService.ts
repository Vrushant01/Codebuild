import { ISymptomData } from "../models/ChatSession.js"

export interface GeminiResponse {
  reply: string
  suggestions?: string[]
  type?: "question" | "summary" | "redirection"
  extractedSymptoms?: Partial<ISymptomData>
  recommendedSpecialization?: string
  isEmergency?: boolean
  emergencyAdvice?: string | null
}

/**
 * Robust JSON extraction helper that strips markdown fences and whitespace
 */
export function cleanAndParseJson<T = any>(rawText: string): T {
  let cleaned = rawText.trim()
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim()
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "").trim()
  }

  // Find first { and last } to avoid any pre/post text
  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }

  return JSON.parse(cleaned) as T
}

export const processChatMessageWithGemini = async (
  conversationHistory: { role: string; text: string }[],
  userMessage: string,
  language: string = "en",
  currentSymptoms: ISymptomData = { symptoms: [] }
): Promise<GeminiResponse> => {
  const apiKey = process.env.GEMINI_API_KEY
  const isGujarati = language === "gu" || /[\u0A80-\u0AFF]/.test(userMessage)
  const isHindi = language === "hi" || /[\u0900-\u097F]/.test(userMessage)
  const targetLanguage = isGujarati ? "Gujarati (ગુજરાતી)" : isHindi ? "Hindi (हिन्दी)" : "English"

  if (apiKey) {
    try {
      const systemPrompt = `You are Medireach's Clinical AI Health Intake & Triage Assistant.
Your primary role is to provide empathetic, structured, and clinically safe healthcare guidance to patients before they consult verified doctors.

CRITICAL SAFETY RESTRICTIONS & GUARDRAILS:
1. NON-DIAGNOSTIC: You are an AI triage assistant, NOT a doctor. Never provide definitive clinical diagnoses. Frame possible conditions cautiously as "potential causes to discuss with a healthcare professional".
2. NO PRESCRIPTION DRUGS: Never recommend prescription-only medications, antibiotics, or controlled substances. You may suggest safe, non-medicinal initial self-care (e.g. hydration with electrolytes, rest, warm salt gargle, cold/warm compress, sleep elevation) with clear disclaimers.
3. EMERGENCY DETECTION (RED FLAGS): If the patient describes acute critical symptoms (crushing chest pain radiating to left arm/jaw, acute shortness of breath, sudden facial drooping/slurred speech/FAST stroke signs, severe head trauma with vomiting, coughing blood, severe allergic reaction/anaphylaxis, thoughts of self-harm):
   - Set "type": "redirection" and "isEmergency": true
   - In "reply", immediately provide urgent warning, life-saving first-aid precautions, instruct them to call emergency services (108 / 112 in India, 911), and advise rushing to the nearest emergency department immediately.
4. STRUCTURED PROGRESSION:
   - If symptoms are just beginning to be described, ask clarifying questions (exact location, duration, severity on 1-10 scale, triggers, fever/chills).
   - If enough information is gathered (symptoms, location, duration, severity), set "type": "summary" and provide a warm summary + safe home-care tips + recommend booking a consultation with the relevant specialist.
5. MULTILINGUAL OUTPUT:
   - Output all patient-facing text ("reply" and "suggestions") naturally in ${targetLanguage}.
   - JSON keys MUST remain in English as per schema.
6. JSON SCHEMA ONLY:
   Respond ONLY with a valid JSON object matching this schema:
   {
     "reply": "Empathetic, clear, structured medical response with reassurance, clinical questions or home-care advice in ${targetLanguage}",
     "suggestions": ["3 short, actionable quick-reply options in ${targetLanguage}"],
     "type": "question" | "summary" | "redirection",
     "extractedSymptoms": {
       "symptoms": ["list of symptoms detected so far"],
       "location": "body location if mentioned or null",
       "duration": "duration if mentioned or null",
       "severity": "severity 1-10 or description if mentioned or null",
       "associatedSymptoms": ["associated symptoms detected"],
       "notes": ["clinical observations or home-care notes"]
     },
     "recommendedSpecialization": "Cardiologist | General Physician | Dermatologist | Orthopedic | ENT | Pediatrician | Gynecologist | Neurologist | Pulmonologist | Gastroenterologist | Psychiatrist | Ophthalmologist | Urologist",
     "isEmergency": false,
     "emergencyAdvice": "null or urgent instructions if isEmergency is true"
   }`

      const contents = [
        ...conversationHistory.slice(-8).map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }]
        })),
        {
          role: "user",
          parts: [{
            text: `Patient Message: "${userMessage}"\nPreviously Extracted Symptoms: ${JSON.stringify(currentSymptoms)}\nLanguage: ${targetLanguage}`
          }]
        }
      ]

      const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash"
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
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
          const parsed = cleanAndParseJson<GeminiResponse>(textOutput)
          if (parsed && parsed.reply) {
            // Merge newly extracted symptoms with previous ones to preserve history
            parsed.extractedSymptoms = {
              symptoms: Array.from(new Set([...(currentSymptoms.symptoms || []), ...(parsed.extractedSymptoms?.symptoms || [])])),
              location: parsed.extractedSymptoms?.location || currentSymptoms.location || null,
              duration: parsed.extractedSymptoms?.duration || currentSymptoms.duration || null,
              severity: parsed.extractedSymptoms?.severity || currentSymptoms.severity || null,
              associatedSymptoms: Array.from(new Set([...(currentSymptoms.associatedSymptoms || []), ...(parsed.extractedSymptoms?.associatedSymptoms || [])])),
              notes: Array.from(new Set([...(currentSymptoms.notes || []), ...(parsed.extractedSymptoms?.notes || [])]))
            }
            return parsed
          }
        }
      } else {
        const errText = await res.text()
        console.warn(`⚠️ Gemini API response error (${res.status}):`, errText)
      }
    } catch (err: any) {
      console.warn("⚠️ Gemini API call error, falling back to intelligent medical triage engine:", err.message)
    }
  }

  // Intelligent fallback engine when API key is not set, quota exhausted, or network fails
  return fallbackMedicalTriage(userMessage, language, currentSymptoms)
}

/**
 * Comprehensive offline & fallback medical triage heuristic engine
 */
export function fallbackMedicalTriage(
  message: string,
  language: string,
  current: ISymptomData = { symptoms: [] }
): GeminiResponse {
  const isGujarati = language === "gu" || /[\u0A80-\u0AFF]/.test(message)
  const isHindi = language === "hi" || /[\u0900-\u097F]/.test(message)
  const lower = message.toLowerCase()

  // 1. Emergency Red Flag Detection
  const emergencyKeywords = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe", "shortness of breath", 
    "severe bleeding", "unconscious", "stroke", "paralysis", "seizure", "suicide", "poison",
    "heart", "cardiac", "stroke",
    "છાતીમાં દુખાવો", "શ્વાસ લેવામાં તકલીફ", "બેભાન", "લોહી નીકળે છે", "હાર્ટ એટેક",
    "सीने में दर्द", "सांस लेने में तकलीफ", "बेहोश", "दिल का दौरा"
  ]

  const isEmergency = 
    emergencyKeywords.some(keyword => lower.includes(keyword) || message.includes(keyword)) ||
    ((lower.includes("chest") || message.includes("છાતી") || message.includes("सीने")) && 
     (lower.includes("pain") || message.includes("દુખાવો") || message.includes("दर्द") || lower.includes("pressure") || message.includes("દબાણ")))

  if (isEmergency) {
    return {
      reply: isGujarati
        ? "⚠️ તાત્કાલિક ચેતવણી: તમારા લક્ષણો ગંભીર ઈમરજન્સી તરફ નિર્દેશ કરે છે. કૃપા કરીને તરત જ ૧૦૮ અથવા ૧૧૨ પર કૉલ કરો અને નજીકની ઈમરજન્સી હોસ્પિટલમાં પહોંચો. સમયસર સારવાર અત્યંત મહત્વપૂર્ણ છે."
        : isHindi
        ? "⚠️ आपातकालीन चेतावनी: आपके लक्षण एक गंभीर स्थिति की ओर इशारा कर रहे हैं। कृपया तुरंत 108 या 112 पर कॉल करें और नजदीकी आपातकालीन अस्पताल जाएं।"
        : "⚠️ CRITICAL MEDICAL ALERT: Your symptoms may indicate an acute emergency. Please immediately dial emergency services (108 / 112 in India, 911) or proceed to the nearest Hospital Emergency Room right away. Do not delay.",
      suggestions: isGujarati 
        ? ["૧૦૮ કૉલ કરો", "નજીકની ઈમરજન્સી હોસ્પિટલ", "પરિવારને જાણ કરો"] 
        : ["Call 108 Emergency", "Find Emergency Hospital", "Notify Family"],
      type: "redirection",
      isEmergency: true,
      emergencyAdvice: "Call emergency 108 / 112 immediately. Keep the patient calm, seated, and rested.",
      extractedSymptoms: {
        symptoms: [...(current.symptoms || []), message],
        severity: "10 (Critical)",
        location: current.location || "Chest / Vital",
        duration: current.duration || "Acute"
      },
      recommendedSpecialization: "Cardiologist"
    }
  }

  // 2. Specialty Mapping based on full accumulated symptom context
  const fullContext = [
    message,
    ...(current.symptoms || []),
    current.location || "",
    ...(current.associatedSymptoms || [])
  ].join(" ").toLowerCase()

  let specialization = "General Physician"
  if (fullContext.includes("chest") || fullContext.includes("heart") || fullContext.includes("palpitation") || fullContext.includes("છાતી")) specialization = "Cardiologist"
  else if (fullContext.includes("skin") || fullContext.includes("rash") || fullContext.includes("itch") || fullContext.includes("pimples") || fullContext.includes("ચામડી")) specialization = "Dermatologist"
  else if (fullContext.includes("bone") || fullContext.includes("knee") || fullContext.includes("joint") || fullContext.includes("fracture") || fullContext.includes("સાંધા") || fullContext.includes("ગોઠણ")) specialization = "Orthopedic"
  else if (fullContext.includes("ear") || fullContext.includes("throat") || fullContext.includes("sinus") || fullContext.includes("tonsil") || fullContext.includes("કાન") || fullContext.includes("ગળું")) specialization = "ENT"
  else if (fullContext.includes("child") || fullContext.includes("baby") || fullContext.includes("infant") || fullContext.includes("kid") || fullContext.includes("બાળક")) specialization = "Pediatrician"
  else if (fullContext.includes("period") || fullContext.includes("pregnancy") || fullContext.includes("menstrual") || fullContext.includes("ગર્ભાવસ્થા")) specialization = "Gynecologist"
  else if (fullContext.includes("stomach") || fullContext.includes("acidity") || fullContext.includes("gas") || fullContext.includes("vomit") || fullContext.includes("diarrhea") || fullContext.includes("પેટ")) specialization = "Gastroenterologist"
  else if (fullContext.includes("cough") || fullContext.includes("asthma") || fullContext.includes("breath") || fullContext.includes("wheezing") || fullContext.includes("ખાંસી")) specialization = "Pulmonologist"
  else if (fullContext.includes("headache") || fullContext.includes("migraine") || fullContext.includes("nerve") || fullContext.includes("dizziness") || fullContext.includes("માથું")) specialization = "Neurologist"
  else if (fullContext.includes("anxiety") || fullContext.includes("stress") || fullContext.includes("depress") || fullContext.includes("તણાવ")) specialization = "Psychiatrist"

  // 3. Track symptoms state
  const updatedSymptoms: ISymptomData = {
    symptoms: Array.from(new Set([...(current.symptoms || [])])),
    location: current.location || null,
    duration: current.duration || null,
    severity: current.severity || null,
    associatedSymptoms: Array.from(new Set([...(current.associatedSymptoms || [])])),
    notes: Array.from(new Set([...(current.notes || [])]))
  }

  // Stage 1: Intake of primary symptom
  if (updatedSymptoms.symptoms.length === 0) {
    updatedSymptoms.symptoms.push(message)
    return {
      reply: isGujarati 
        ? `હું તમારી તકલીફ સમજી શકું છું. આ બાબતે હું તમને મદદ કરીશ.\n\nતમને આ તકલીફ અથવા દુખાવો શરીરના કયા ભાગમાં વધુ થાય છે?`
        : `I understand your concern and I'm here to help guide you safely.\n\nTo better assist you, where exactly in your body are you experiencing this discomfort?`,
      suggestions: isGujarati 
        ? ["માથું / ગળું", "પેટ / પાચન", "છાતી / પીઠ", "હાથ / પગ / સાંધા"] 
        : ["Head / Throat", "Stomach / Abdomen", "Chest / Back", "Arms / Legs / Joints"],
      type: "question",
      extractedSymptoms: updatedSymptoms,
      recommendedSpecialization: specialization
    }
  }

  // Stage 2: Location tracking
  if (!updatedSymptoms.location) {
    updatedSymptoms.location = message
    return {
      reply: isGujarati
        ? `નોંધ કરી લીધી છે. આ લક્ષણો તમને કેટલા સમયથી (કેટલા દિવસ કે કલાકથી) અનુભવાઈ રહ્યા છે?`
        : `Thank you for specifying. How long have you been experiencing these symptoms?`,
      suggestions: isGujarati 
        ? ["આજથી જ (થોડા કલાકો)", "૨-૩ દિવસથી", "૧ અઠવાડિયાથી વધુ", "મહિનાથી વધુ"] 
        : ["Since today (few hours)", "2-3 days", "Over 1 week", "More than a month"],
      type: "question",
      extractedSymptoms: updatedSymptoms,
      recommendedSpecialization: specialization
    }
  }

  // Stage 3: Duration tracking
  if (!updatedSymptoms.duration) {
    updatedSymptoms.duration = message
    return {
      reply: isGujarati
        ? `સમજાયું. ૧ થી ૧૦ ના સ્કેલ પર (જ્યાં ૧ એટલે હળવો અને ૧૦ એટલે અતિશય ગંભીર), આ દુખાવો અથવા તકલીફ કેટલી તીવ્ર લાગે છે?`
        : `Got it. On a scale of 1 to 10 (1 = mild discomfort, 10 = unbearable pain), how severe is the discomfort?`,
      suggestions: ["2-3 (Mild)", "5-6 (Moderate)", "7-8 (Severe)", "9-10 (Intense)"],
      type: "question",
      extractedSymptoms: updatedSymptoms,
      recommendedSpecialization: specialization
    }
  }

  // Stage 4: Severity & Associated Symptoms
  if (!updatedSymptoms.severity) {
    updatedSymptoms.severity = message
    return {
      reply: isGujarati
        ? `શું તમને આ સાથે તાવ, ચક્કર, ઉબકા, કે કમજોરી જેવા અન્ય કોઈ લક્ષણો જણાય છે?`
        : `Are you experiencing any accompanying symptoms, such as fever, dizziness, nausea, or fatigue?`,
      suggestions: isGujarati 
        ? ["હળવો તાવ છે", "ચક્કર / નબળાઈ છે", "કોઈ અન્ય લક્ષણ નથી", "ઉબકા / ઉલટી છે"] 
        : ["Mild fever", "Dizziness / Fatigue", "No other symptoms", "Nausea"],
      type: "question",
      extractedSymptoms: updatedSymptoms,
      recommendedSpecialization: specialization
    }
  }

  // Stage 5: Summary & Clinical Guidance
  if (message) {
    updatedSymptoms.associatedSymptoms = Array.from(new Set([...(updatedSymptoms.associatedSymptoms || []), message]))
  }

  return {
    reply: isGujarati
      ? `તમારી માહિતી વ્યવસ્થિત રીતે નોંધાઈ ગઈ છે.\n\n🩺 **સલાહ અને પ્રારંભિક પગલાં:**\n• પૂરતો આરામ લો અને શરીરને હાઇડ્રેટેડ રાખો (હૂંફાળું પાણી અથવા ORS).\n• આ સ્થિતિ માટે યોગ્ય **${specialization}** ની સલાહ લેવાની ભલામણ છે.\n• જો તકલીફ વધે તો તાત્કાલિક ડોક્ટર પાસે પહોંચો.\n\nનીચે આપેલા વિકલ્પો દ્વારા તમે નજીકના ડોક્ટર શોધી શકો છો અથવા ઓનલાઇન કન્સલ્ટેશન બુક કરી શકો છો.`
      : `Your symptom profile has been organized.\n\n🩺 **Clinical Triage Summary & Initial Care:**\n• **Self-care:** Ensure adequate hydration (electrolytes/warm fluids) and restful recovery.\n• **Recommended Care:** Based on your symptoms, we recommend consulting a **${specialization}** for a complete evaluation.\n• **Safety Alert:** If symptoms worsen or red flags emerge, seek immediate medical attention.\n\nYou can now view verified doctors and healthcare centers on Medireach to schedule your consultation.`,
    suggestions: isGujarati 
      ? ["નજીકના ડોક્ટર શોધો", "હોસ્પિટલ મેપ જુઓ", "ઓનલાઇન કન્સલ્ટેશન"] 
      : ["Find Nearby Doctors", "Explore Hospital Map", "Book Teleconsultation"],
    type: "summary",
    extractedSymptoms: updatedSymptoms,
    recommendedSpecialization: specialization
  }
}

