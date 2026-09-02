import { Router, Response } from "express"
import { ChatSession } from "../models/ChatSession.js"
import { processChatMessageWithGemini } from "../services/geminiService.js"
import { optionalAuthenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

// POST /api/chat/message (Gemini AI Symptom Conversational Intake)
router.post("/message", optionalAuthenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, language = "en", history = [], currentSymptoms = {} } = req.body

    if (!message) {
      res.status(400).json({ success: false, message: "Message is required." })
      return
    }

    const aiResult = await processChatMessageWithGemini(
      history,
      message,
      language,
      currentSymptoms
    )

    res.status(200).json({
      success: true,
      data: {
        response: {
          role: "assistant",
          type: aiResult.type || "question",
          text: aiResult.reply,
          suggestions: aiResult.suggestions || []
        },
        updatedSymptoms: aiResult.extractedSymptoms || currentSymptoms,
        recommendedSpecialization: aiResult.recommendedSpecialization
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error processing chat message" })
  }
})

// POST /api/chat/session (Save or update chat session)
router.post("/session", optionalAuthenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    const { sessionId, language, messages, symptoms, extractedSpecialization } = req.body

    const session = await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        patientUserId: user?._id,
        sessionId,
        language: language || "en",
        messages,
        symptoms,
        extractedSpecialization
      },
      { upsert: true, new: true }
    )

    res.status(200).json({ success: true, data: session })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error saving chat session" })
  }
})

// GET /api/chat/sessions (History)
router.get("/sessions", optionalAuthenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(200).json({ success: true, data: [] })
      return
    }

    const sessions = await ChatSession.find({ patientUserId: user._id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean()

    res.status(200).json({ success: true, data: sessions })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching chat sessions" })
  }
})

export default router
