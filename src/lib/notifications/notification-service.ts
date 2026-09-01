import type { AppNotification, NotificationPreferences } from "./notification-types"
import { notificationFactory } from "./notification-factory"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class NotificationService {
  private notifications: Record<string, AppNotification[]> = {}
  private preferences: Record<string, NotificationPreferences> = {}

  private generateInitialNotifications(userId: string): AppNotification[] {
    const list: AppNotification[] = [
      notificationFactory.appointmentConfirmed(userId),
      notificationFactory.appointmentReminder(userId),
      notificationFactory.appointmentCancelled(userId),
      notificationFactory.appointmentRejected(userId),
      
      notificationFactory.medicineReminder(userId),
      notificationFactory.medicineUpdated(userId),
      notificationFactory.medicineCompleted(userId),

      notificationFactory.feedbackAvailable(userId),
      notificationFactory.feedbackVerified(userId),

      notificationFactory.telemedicineStarting(userId),
      notificationFactory.followUpConfirmed(userId),

      notificationFactory.systemInfo(userId),
    ]

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      appointmentUpdates: true,
      medicineReminders: true,
      feedbackUpdates: true,
      telemedicineReminders: true,
    }
  }

  async getNotifications(userId: string, role?: string): Promise<AppNotification[]> {
    await mockDelay(300)
    // Only generating mock notifications for the PATIENT role for this specific prompt
    if (!this.notifications[userId] && (!role || role === "PATIENT")) {
      this.notifications[userId] = this.generateInitialNotifications(userId)
    } else if (!this.notifications[userId]) {
      this.notifications[userId] = []
    }
    return [...this.notifications[userId]]
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!this.notifications[userId]) return 0
    return this.notifications[userId].filter(n => !n.read).length
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await mockDelay(50)
    if (!this.notifications[userId]) return
    const index = this.notifications[userId].findIndex(n => n.id === notificationId)
    if (index !== -1) {
      this.notifications[userId][index] = { ...this.notifications[userId][index], read: true }
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await mockDelay(300)
    if (!this.notifications[userId]) return
    this.notifications[userId] = this.notifications[userId].map(n => ({ ...n, read: true }))
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    await mockDelay(300)
    if (!this.preferences[userId]) {
      this.preferences[userId] = this.getDefaultPreferences()
    }
    return { ...this.preferences[userId] }
  }

  async updatePreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    await mockDelay(300)
    if (!this.preferences[userId]) {
      this.preferences[userId] = this.getDefaultPreferences()
    }
    this.preferences[userId] = { ...this.preferences[userId], ...prefs }
    return { ...this.preferences[userId] }
  }
}

export const notificationService = new NotificationService()
