import { Calendar, Pill, Star, Video, Activity, Info, CalendarX2, ArrowRight } from "lucide-react"
import type { AppNotification } from "./notification-types"
import { NotificationType, NotificationCategory } from "./notification-types"

export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.APPOINTMENT_CONFIRMED:
    case NotificationType.APPOINTMENT_REMINDER:
    case NotificationType.APPOINTMENT_RESCHEDULED:
      return Calendar
    case NotificationType.APPOINTMENT_CANCELLED:
    case NotificationType.APPOINTMENT_REJECTED:
      return CalendarX2
    case NotificationType.MEDICINE_REMINDER:
    case NotificationType.MEDICINE_UPDATED:
    case NotificationType.MEDICINE_COMPLETED:
      return Pill
    case NotificationType.FEEDBACK_AVAILABLE:
    case NotificationType.FEEDBACK_SUBMITTED:
    case NotificationType.FEEDBACK_VERIFIED:
      return Star
    case NotificationType.TELEMEDICINE_STARTING_SOON:
    case NotificationType.TELEMEDICINE_JOIN:
      return Video
    case NotificationType.FOLLOW_UP_REQUESTED:
    case NotificationType.FOLLOW_UP_CONFIRMED:
      return Activity
    case NotificationType.SYSTEM_PROFILE_UPDATE:
    case NotificationType.SYSTEM_INFO:
      return Info
    default:
      return ArrowRight
  }
}

export function getNotificationCategory(type: NotificationType): NotificationCategory {
  if (type.startsWith("APPOINTMENT_")) return NotificationCategory.APPOINTMENTS
  if (type.startsWith("MEDICINE_")) return NotificationCategory.MEDICINES
  if (type.startsWith("FEEDBACK_")) return NotificationCategory.FEEDBACK
  if (type.startsWith("TELEMEDICINE_") || type.startsWith("FOLLOW_UP_")) return NotificationCategory.APPOINTMENTS
  if (type.startsWith("SYSTEM_")) return NotificationCategory.SYSTEM
  return NotificationCategory.ALL
}

export function getNotificationTarget(notification: AppNotification, role?: string): string | null {
  // If it's a specific route requirement based on entityType
  if (notification.entityType === "APPOINTMENT") {
    return role === "DOCTOR" ? `/app/doctor/appointments/${notification.entityId}` : `/app/patient/appointments`
  }
  
  if (notification.entityType === "MEDICINE") {
    return `/app/patient/medical-history` // Using existing prompt 26/27 location
  }

  if (notification.entityType === "REVIEW") {
    return role === "DOCTOR" ? `/app/doctor/feedback` : `/app/patient/reviews`
  }

  if (notification.entityType === "TELEMEDICINE") {
    return `/app/patient/telemedicine`
  }

  if (notification.entityType === "FOLLOW_UP") {
    return `/app/patient/appointments`
  }

  if (notification.entityType === "SYSTEM") {
    return `/app/patient/profile`
  }

  return null
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "Just now"
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    if (diffInHours === 1) return "1 hour ago"
    return `${diffInHours} hours ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
