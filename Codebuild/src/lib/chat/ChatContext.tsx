import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import type { ChatSession, ChatMessage, SymptomData } from "./chat-types"
import { mockAiService } from "./mock-ai-service"
import { useLanguage } from "../i18n/LanguageContext"
import { useAuth } from "../auth/AuthContext"
import { apiClient } from "../api/apiClient"

interface ChatContextType {
  activeSession: ChatSession | null
  history: ChatSession[]
  isTyping: boolean
  startNewSession: () => void
  sendMessage: (text: string) => Promise<void>
  loadSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
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
  const { user } = useAuth()
  const [history, setHistory] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Derive unique identifier for current logged in user
  const userId = user?.id || (user as any)?._id || (user?.email ? user.email.toLowerCase().trim() : "anonymous_guest")
  const storageKey = `medireach_chat_history_${userId}`
  const prevUserIdRef = useRef<string | null>(null)

  // Function to create a fresh empty session
  const createNewSessionObject = (): ChatSession => ({
    id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: "New Conversation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: currentLanguage,
    messages: [],
    symptoms: createEmptySymptoms(),
    healthcareSearchReady: false
  })

  // Load chat history when user changes or mounts
  useEffect(() => {
    // If user switched, reset active session to prevent showing previous user's chat
    const isUserSwitch = prevUserIdRef.current !== null && prevUserIdRef.current !== userId
    prevUserIdRef.current = userId

    let initialHistory: ChatSession[] = []
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        initialHistory = JSON.parse(saved)
      }
    } catch (e) {
      console.warn("Failed to parse user chat history:", e)
    }

    setHistory(initialHistory)

    if (isUserSwitch || !activeSession) {
      mockAiService.resetState()
      setActiveSession(createNewSessionObject())
    }

    // If authenticated, also fetch server-synced sessions for this user
    if (user) {
      apiClient.get<{ success: boolean; data: any[] }>("/chat/sessions")
        .then(res => {
          if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
            const serverSessions: ChatSession[] = res.data.map(item => ({
              id: item.sessionId || item._id,
              title: item.messages?.[0]?.text?.substring(0, 30) || "Conversation",
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
              language: item.language || currentLanguage,
              messages: item.messages || [],
              symptoms: item.symptoms || createEmptySymptoms(),
              healthcareSearchReady: false
            }))

            setHistory(prev => {
              // Merge server sessions with local ones, eliminating duplicates by ID
              const map = new Map<string, ChatSession>()
              serverSessions.forEach(s => map.set(s.id, s))
              prev.forEach(s => map.set(s.id, s))
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              )
              localStorage.setItem(storageKey, JSON.stringify(merged))
              return merged
            })
          }
        })
        .catch(err => console.warn("Could not sync server chat sessions:", err.message))
    }
  }, [userId])

  const startNewSession = () => {
    mockAiService.resetState()
    const newSession = createNewSessionObject()
    setActiveSession(newSession)
  }

  const saveToHistory = (session: ChatSession) => {
    setHistory(prev => {
      const existing = prev.findIndex(s => s.id === session.id)
      let newHistory = [...prev]
      if (existing >= 0) {
        newHistory[existing] = session
      } else {
        newHistory = [session, ...prev]
      }
      localStorage.setItem(storageKey, JSON.stringify(newHistory))
      return newHistory
    })

    // Sync to backend if authenticated
    if (user && session.messages.length > 0) {
      apiClient.post("/chat/session", {
        sessionId: session.id,
        language: session.language,
        messages: session.messages,
        symptoms: session.symptoms
      }).catch(err => console.warn("Failed to sync session to backend:", err))
    }
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
      const historyPayload = currentSession.messages.map(m => ({ role: m.role, text: m.text }))
      const { response, updatedSymptoms } = await mockAiService.processUserMessage(
        text,
        currentSession.language,
        historyPayload,
        currentSession.symptoms
      )
      
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        timestamp: new Date().toISOString(),
        ...response
      }

      currentSession = {
        ...currentSession,
        messages: [...currentSession.messages, aiMessage],
        symptoms: updatedSymptoms,
        healthcareSearchReady: response.type === "transition" || response.type === "symptom-summary" || response.type === "summary",
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
    }
  }

  const deleteSession = (sessionId: string) => {
    setHistory(prev => {
      const filtered = prev.filter(s => s.id !== sessionId)
      localStorage.setItem(storageKey, JSON.stringify(filtered))
      return filtered
    })

    if (activeSession?.id === sessionId) {
      startNewSession()
    }
  }

  return (
    <ChatContext.Provider value={{
      activeSession,
      history,
      isTyping,
      startNewSession,
      sendMessage,
      loadSession,
      deleteSession
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

