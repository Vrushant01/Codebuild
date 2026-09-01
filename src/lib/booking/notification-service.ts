import type { Appointment } from "./appointment-types"

export type NotificationEventType = 
  | "appointment.requested"
  | "appointment.confirmed"
  | "appointment.rejected"
  | "appointment.cancelled"
  | "appointment.reminder"

export interface NotificationEvent {
  id: string
  type: NotificationEventType
  message: string
  appointmentId: string
  timestamp: string
  isRead: boolean
}

class NotificationService {
  private notifications: NotificationEvent[] = []

  private addNotification(type: NotificationEventType, message: string, appointmentId: string) {
    const event: NotificationEvent = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      appointmentId,
      timestamp: new Date().toISOString(),
      isRead: false
    }
    this.notifications.unshift(event)
    console.log(`[Notification Mock] ${type}: ${message}`)
    return event
  }

  notifyAppointmentRequested(appointment: Appointment) {
    return this.addNotification("appointment.requested", `Your appointment request with ${appointment.doctor.name} has been sent.`, appointment.id)
  }

  notifyAppointmentConfirmed(appointment: Appointment) {
    return this.addNotification("appointment.confirmed", `Your appointment with ${appointment.doctor.name} on ${appointment.date} is confirmed.`, appointment.id)
  }

  notifyAppointmentRejected(appointment: Appointment) {
    return this.addNotification("appointment.rejected", `Your appointment request with ${appointment.doctor.name} was rejected by the provider.`, appointment.id)
  }

  notifyAppointmentCancelled(appointment: Appointment) {
    return this.addNotification("appointment.cancelled", `Your appointment with ${appointment.doctor.name} has been cancelled.`, appointment.id)
  }

  notifyAppointmentReminder(appointment: Appointment) {
    return this.addNotification("appointment.reminder", `Reminder: Your appointment with ${appointment.doctor.name} starts in 1 hour.`, appointment.id)
  }

  getNotifications() {
    return [...this.notifications]
  }
}

export const notificationService = new NotificationService()
