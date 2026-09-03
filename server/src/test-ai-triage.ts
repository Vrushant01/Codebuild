import assert from "node:assert"
import { cleanAndParseJson, fallbackMedicalTriage, GeminiResponse } from "./services/geminiService.js"

console.log("🧪 Running AI Triage & Guardrail Engine self-check tests...\n")

// Test 1: JSON Cleaner & Parser
{
  const rawClean = JSON.stringify({ reply: "Hello patient", type: "question", suggestions: ["Option 1"] })
  const parsedClean = cleanAndParseJson<GeminiResponse>(rawClean)
  assert.strictEqual(parsedClean.reply, "Hello patient")

  const rawMarkdown = `\`\`\`json
  {
    "reply": "Empathetic response",
    "type": "summary",
    "suggestions": ["Find Doctor", "Map"],
    "recommendedSpecialization": "Cardiologist",
    "extractedSymptoms": {
      "symptoms": ["chest pain"],
      "location": "chest"
    }
  }
  \`\`\``
  const parsedMarkdown = cleanAndParseJson<GeminiResponse>(rawMarkdown)
  assert.strictEqual(parsedMarkdown.reply, "Empathetic response")
  assert.strictEqual(parsedMarkdown.recommendedSpecialization, "Cardiologist")
  assert.strictEqual(parsedMarkdown.type, "summary")
  console.log("✅ Test 1 Passed: Resilient JSON parsing & markdown fence extraction.")
}

// Test 2: Emergency Red Flag Detection
{
  const emergencyInput = fallbackMedicalTriage("Severe acute chest pain and shortness of breath", "en")
  assert.strictEqual(emergencyInput.isEmergency, true)
  assert.strictEqual(emergencyInput.type, "redirection")
  assert.ok(emergencyInput.reply.includes("108") || emergencyInput.reply.includes("CRITICAL"))
  assert.ok(emergencyInput.suggestions && emergencyInput.suggestions.length > 0)
  console.log("✅ Test 2 Passed: Emergency red flag detection & immediate hospital redirection.")
}

// Test 3: Emergency Red Flag in Gujarati
{
  const emergencyGujarati = fallbackMedicalTriage("મને છાતીમાં ખૂબ દુખાવો થાય છે", "gu")
  assert.strictEqual(emergencyGujarati.isEmergency, true)
  assert.strictEqual(emergencyGujarati.type, "redirection")
  assert.ok(emergencyGujarati.reply.includes("૧૦૮") || emergencyGujarati.reply.includes("ઈમરજન્સી"))
  console.log("✅ Test 3 Passed: Emergency detection in Gujarati (ગુજરાતી).")
}

// Test 4: Specialty Classification
{
  const skinCase = fallbackMedicalTriage("I have an itchy red skin rash on my arm", "en")
  assert.strictEqual(skinCase.recommendedSpecialization, "Dermatologist")

  const kneeCase = fallbackMedicalTriage("Severe knee joint pain and swelling", "en")
  assert.strictEqual(kneeCase.recommendedSpecialization, "Orthopedic")

  const coughCase = fallbackMedicalTriage("Severe dry cough and asthma wheezing", "en")
  assert.strictEqual(coughCase.recommendedSpecialization, "Pulmonologist")
  console.log("✅ Test 4 Passed: Medical specialization matching across clinical domains.")
}

// Test 5: Multi-Stage Intake Flow & Progression
{
  // Stage 1: Initial symptom
  const stage1 = fallbackMedicalTriage("Severe headache", "en")
  assert.strictEqual(stage1.type, "question")
  assert.ok(stage1.extractedSymptoms?.symptoms?.includes("Severe headache"))

  // Stage 2: Location
  const stage2 = fallbackMedicalTriage("Forehead and temple", "en", stage1.extractedSymptoms as any)
  assert.strictEqual(stage2.extractedSymptoms?.location, "Forehead and temple")

  // Stage 3: Duration
  const stage3 = fallbackMedicalTriage("3 days", "en", stage2.extractedSymptoms as any)
  assert.strictEqual(stage3.extractedSymptoms?.duration, "3 days")

  // Stage 4: Severity
  const stage4 = fallbackMedicalTriage("7 (Severe)", "en", stage3.extractedSymptoms as any)
  assert.strictEqual(stage4.extractedSymptoms?.severity, "7 (Severe)")

  // Stage 5: Summary with clinical advice
  const stage5 = fallbackMedicalTriage("Mild nausea", "en", stage4.extractedSymptoms as any)
  assert.strictEqual(stage5.type, "summary")
  assert.ok(stage5.reply.includes("Clinical Triage Summary"))
  assert.strictEqual(stage5.recommendedSpecialization, "Neurologist")
  console.log("✅ Test 5 Passed: Multi-stage triage progression and symptom data aggregation.")
}

console.log("\n🎉 All 5 AI Triage self-check tests passed successfully!")
