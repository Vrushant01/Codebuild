import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { type AppNotification, type NotificationPreferences, NotificationType } from "./notification-types"
import { notificationService } from "./notification-service"
import { useAuth } from "../auth/AuthContext"
import { checkAndTriggerMedicationReminders, requestNotificationPermission } from "./medication-reminder-scheduler"
import { getSocketClient, syncUserSocket } from "../socket/socket-client"
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
  requestBrowserPermission: () => Promise<NotificationPermission>
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

  const simulateNotification = useCallback((newNotification: AppNotification) => {
    setNotifications(prev => {
      if (prev.some(n => n.id === newNotification.id)) return prev
      return [newNotification, ...prev]
    })
    
    // Render custom toast for the new notification
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-in slide-in-from-top-full' : 'animate-out slide-out-to-top-full'
        } max-w-sm w-full bg-background border-2 border-primary/30 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden duration-300`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl shadow-inner">
                🔔
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-foreground">
                {newNotification.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {newNotification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-border">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-xs font-bold text-primary hover:bg-muted focus:outline-none"
          >
            Got it
          </button>
        </div>
      </div>
    ), { duration: 6000 })
  }, [])

  // Live WebSocket Real-Time Listener for instant notifications & appointments
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const socket = getSocketClient()
    syncUserSocket(user)

    const handleNewNotification = (data: any) => {
      const notifItem: AppNotification = {
        id: data.id || `notif_${Date.now()}`,
        userId: user.id,
        type: NotificationType.APPOINTMENT_CONFIRMED,
        title: data.title || "New Notification",
        message: data.message || "You have a new update.",
        createdAt: new Date().toISOString(),
        read: false,
        actionUrl: data.actionUrl || "/app/appointments",
        actionLabel: data.actionLabel || "View"
      }
      simulateNotification(notifItem)
      loadData()
    }

    const handleAppointmentRequest = (data: any) => {
      const patientName = data.patientName || "A patient"
      const timeStr = data.startTime || ""
      const dateStr = data.date || ""
      const notifItem: AppNotification = {
        id: `apt_req_${Date.now()}`,
        userId: user.id,
        type: NotificationType.APPOINTMENT_REMINDER,
        title: "🩺 New Appointment Request",
        message: `${patientName} requested an appointment${dateStr ? ` for ${dateStr}` : ""}${timeStr ? ` at ${timeStr}` : ""}.`,
        createdAt: new Date().toISOString(),
        read: false,
        actionUrl: "/app/doctor/appointments",
        actionLabel: "Review"
      }
      simulateNotification(notifItem)
      loadData()
    }

    const handleStatusChanged = (data: any) => {
      const status = data.status || "UPDATED"
      const notifItem: AppNotification = {
        id: `apt_status_${Date.now()}`,
        userId: user.id,
        type: status === "ACCEPTED" || status === "CONFIRMED" ? NotificationType.APPOINTMENT_CONFIRMED : NotificationType.APPOINTMENT_REJECTED,
        title: status === "ACCEPTED" || status === "CONFIRMED" ? "✅ Appointment Confirmed" : `Appointment ${status}`,
        message: data.message || `Your appointment status has changed to ${status}.`,
        createdAt: new Date().toISOString(),
        read: false,
        actionUrl: "/app/patient/appointments",
        actionLabel: "View"
      }
      simulateNotification(notifItem)
      loadData()
    }

    socket.on("new-notification", handleNewNotification)
    socket.on("new-appointment-request", handleAppointmentRequest)
    socket.on("appointment-status-changed", handleStatusChanged)

    return () => {
      socket.off("new-notification", handleNewNotification)
      socket.off("new-appointment-request", handleAppointmentRequest)
      socket.off("appointment-status-changed", handleStatusChanged)
    }
  }, [isAuthenticated, user, simulateNotification, loadData])

  // Automated background checker for medication reminders
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "PATIENT") return

    checkAndTriggerMedicationReminders((notif) => {
      simulateNotification(notif)
    })

    const interval = setInterval(() => {
      checkAndTriggerMedicationReminders((notif) => {
        simulateNotification(notif)
      })
    }, 20000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user?.role, simulateNotification])

  const markAsRead = async (id: string) => {
    if (!user?.id) return
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await notificationService.markAsRead(user.id, id)
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await notificationService.markAllAsRead(user.id)
  }

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!user?.id) return
    setPreferences(prev => prev ? { ...prev, ...prefs } : null)
    await notificationService.updatePreferences(user.id, prefs)
    toast.success("Notification preferences updated.")
  }

  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    const perm = await requestNotificationPermission()
    if (perm === "granted") {
      toast.success("Browser notifications enabled for medication reminders! 🔔")
    }
    return perm
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
        requestBrowserPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
