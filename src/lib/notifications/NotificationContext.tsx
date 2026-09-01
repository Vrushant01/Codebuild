import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { AppNotification, NotificationPreferences } from "./notification-types"
import { notificationService } from "./notification-service"
import { useAuth } from "../auth/AuthContext"
import { toast } from "react-hot-toast"

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  preferences: NotificationPreferences | null
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
  simulateNotification: (notification: AppNotification) => void
  reloadNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([])
      setPreferences(null)
      return
    }

    setIsLoading(true)
    try {
      const [notifs, prefs] = await Promise.all([
        notificationService.getNotifications(user.id, user.role),
        notificationService.getPreferences(user.id)
      ])
      setNotifications(notifs)
      setPreferences(prefs)
    } catch (error) {
      console.error("Failed to load notifications", error)
    } finally {
      setIsLoading(false)
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    loadData()
  }, [loadData])

  const markAsRead = async (id: string) => {
    if (!user?.id) return
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await notificationService.markAsRead(user.id, id)
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await notificationService.markAllAsRead(user.id)
  }

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!user?.id) return
    setPreferences(prev => prev ? { ...prev, ...prefs } : null)
    await notificationService.updatePreferences(user.id, prefs)
    toast.success("Notification preferences updated.")
  }

  const simulateNotification = (newNotification: AppNotification) => {
    setNotifications(prev => [newNotification, ...prev])
    
    // Render custom toast for the new notification
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-in slide-in-from-top-full' : 'animate-out slide-out-to-top-full'
        } max-w-sm w-full bg-background border shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="text-xl">🔔</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-foreground">
                {newNotification.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {newNotification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-border">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:bg-muted focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ), { duration: 5000 })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        isLoading,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        simulateNotification,
        reloadNotifications: loadData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
