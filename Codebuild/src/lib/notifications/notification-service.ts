import type { AppNotification, NotificationPreferences } from "./notification-types"
import { apiClient } from "../api/apiClient"

class NotificationService {
  private localNotifications: AppNotification[] = []
  private preferences: Record<string, NotificationPreferences> = {}

  private getDefaultPreferences(): NotificationPreferences {
    return {
      appointmentUpdates: true,
      medicineReminders: true,
      feedbackUpdates: true,
      telemedicineReminders: true,
    }
  }

  async getNotifications(userId: string, role?: string): Promise<AppNotification[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/notifications")
      if (res && res.data && res.data.length > 0) {
        return res.data.map(n => ({
          id: n.id || n._id,
          userId,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read || false,
          createdAt: n.createdAt || new Date().toISOString(),
          actionUrl: n.actionUrl || (n.relatedAppointmentId ? `/appointments/${n.relatedAppointmentId}` : undefined)
        }))
      }
    } catch (err) {}

    return [...this.localNotifications]
  }

  async createNotification(data: { title: string; message: string; type?: string; actionUrl?: string }): Promise<AppNotification | null> {
    try {
      const res = await apiClient.post<{ success: boolean; data: any }>("/notifications", data)
      if (res && res.data) {
        const notif: AppNotification = {
          id: res.data.id || res.data._id,
          userId: res.data.userId,
          title: res.data.title,
          message: res.data.message,
          type: res.data.type,
          read: false,
          createdAt: res.data.createdAt || new Date().toISOString(),
          actionUrl: res.data.actionUrl
        }
        this.localNotifications.unshift(notif)
        return notif
      }
    } catch (err) {
      console.warn("⚠️ Failed to persist notification to server:", err)
    }

    const fallback: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: "current",
      title: data.title,
      message: data.message,
      type: (data.type as any) || "MEDICINE_REMINDER",
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: data.actionUrl
    }
    this.localNotifications.unshift(fallback)
    return fallback
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const res = await apiClient.get<{ success: boolean; unreadCount: number }>("/notifications")
      if (typeof res?.unreadCount === "number") return res.unreadCount
    } catch {}

    return this.localNotifications.filter(n => !n.read).length
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`)
    } catch {}

    const idx = this.localNotifications.findIndex(n => n.id === notificationId)
    if (idx !== -1) {
      this.localNotifications[idx].read = true
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await apiClient.post("/notifications/mark-all-read")
    } catch {}

    this.localNotifications = this.localNotifications.map(n => ({ ...n, read: true }))
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    if (!this.preferences[userId]) {
      this.preferences[userId] = this.getDefaultPreferences()
    }
    return { ...this.preferences[userId] }
  }

  async updatePreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    if (!this.preferences[userId]) {
      this.preferences[userId] = this.getDefaultPreferences()
    }
    this.preferences[userId] = { ...this.preferences[userId], ...prefs }
    return { ...this.preferences[userId] }
  }
}

export const notificationService = new NotificationService()
