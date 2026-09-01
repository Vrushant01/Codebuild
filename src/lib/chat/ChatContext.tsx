import React, { createContext, useContext, useState, useEffect } from "react"
import type { ChatSession, ChatMessage, SymptomData } from "./chat-types"
import { mockAiService } from "./mock-ai-service"
import { useLanguage } from "../i18n/LanguageContext"

interface ChatContextType {
  activeSession: ChatSession | null
  history: ChatSession[]
  isTyping: boolean
  startNewSession: () => void
  sendMessage: (text: string) => Promise<void>
  loadSession: (sessionId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const createEmptySymptoms = (): SymptomData => ({
  symptoms: [],
  location: null,
  duration: null,
  severity: null,
  associatedSymptoms: [],
  notes: []
})

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { currentLanguage } = useLanguage()
  const [history, setHistory] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("medireach_chat_history")
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch(e) {}
    }
  }, [])

  const startNewSession = () => {
    mockAiService.resetState()
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: currentLanguage,
      messages: [],
      symptoms: createEmptySymptoms(),
      healthcareSearchReady: false
    }
    setActiveSession(newSession)
  }

  // Auto-start session if none exists when Provider mounts
  useEffect(() => {
    if (!activeSession) {
      startNewSession()
    }
  }, [])

  const saveToHistory = (session: ChatSession) => {
    setHistory(prev => {
      const existing = prev.findIndex(s => s.id === session.id)
      let newHistory = [...prev]
      if (existing >= 0) {
        newHistory[existing] = session
      } else {
        newHistory = [session, ...prev]
      }
      localStorage.setItem("medireach_chat_history", JSON.stringify(newHistory))
      return newHistory
    })
  }

  const sendMessage = async (text: string) => {
    if (!activeSession) return

    // 1. Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      type: "text",
      text,
      timestamp: new Date().toISOString()
    }

    let currentSession = {
      ...activeSession,
      title: activeSession.messages.length === 0 ? text.substring(0, 30) + (text.length > 30 ? "..." : "") : activeSession.title,
      messages: [...activeSession.messages, userMessage],
      updatedAt: new Date().toISOString()
    }
    setActiveSession(currentSession)
    
    // 2. Trigger AI processing
    setIsTyping(true)
    try {
      const { response, updatedSymptoms } = await mockAiService.processUserMessage(text, currentSession.language)
      
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        timestamp: new Date().toISOString(),
        ...response
      }

      currentSession = {
        ...currentSession,
        messages: [...currentSession.messages, aiMessage],
        symptoms: updatedSymptoms,
        healthcareSearchReady: response.type === "transition",
        updatedAt: new Date().toISOString()
      }
      
      setActiveSession(currentSession)
      saveToHistory(currentSession)

    } catch (e) {
      console.error("AI Service Error:", e)
    } finally {
      setIsTyping(false)
    }
  }

  const loadSession = (sessionId: string) => {
    const session = history.find(s => s.id === sessionId)
    if (session) {
      setActiveSession(session)
      // We don't restore aiState perfectly in this mock, but it's enough for viewing history
    }
  }

  return (
    <ChatContext.Provider value={{
      activeSession,
      history,
      isTyping,
      startNewSession,
      sendMessage,
      loadSession
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
