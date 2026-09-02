import { scheduleService } from "../schedule/schedule-service"
import { notificationService } from "./notification-service"
import type { AppNotification } from "./notification-types"
import { apiClient } from "../api/apiClient"
import { toast } from "react-hot-toast"

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied"
  }
  if (Notification.permission === "default") {
    try {
      const perm = await Notification.requestPermission()
      return perm
    } catch (e) {
      console.warn("Error requesting notification permission:", e)
    }
  }
  return Notification.permission
}

export const sendBrowserNotification = (title: string, body: string, actionUrl: string = "/app/patient/schedule") => {
  if (typeof window === "undefined" || !("Notification" in window)) return

  if (Notification.permission === "granted") {
    try {
      const notif = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `med_${Date.now()}`
      })

      notif.onclick = () => {
        window.focus()
        if (actionUrl) {
          window.location.href = actionUrl
        }
      }
    } catch (err) {
      console.warn("Failed to create Web Notification:", err)
    }
  }
}

/**
 * Parses a time string like "07:48 PM", "8:00 AM", "14:30" into total minutes from midnight.
 */
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return -1
  const trimmed = timeStr.trim()
  
  // Format: "07:48 PM" or "8:00 AM"
  const match = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const ampm = match[3]?.toUpperCase()

    if (ampm === "PM" && hours < 12) hours += 12
    if (ampm === "AM" && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  // Format: "19:48"
  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (colonMatch) {
    return parseInt(colonMatch[1], 10) * 60 + parseInt(colonMatch[2], 10)
  }

  return -1
}

/**
 * Checks all active medicines and triggers 10-minute prior and exact-time notifications.
 */
export const checkAndTriggerMedicationReminders = async (
  onNewNotification?: (notif: AppNotification) => void
): Promise<void> => {
  try {
    const medicines = await scheduleService.getMedicines()
    const activeMeds = medicines.filter(m => m.status === "active" && m.reminderEnabled !== false)
    if (activeMeds.length === 0) return

    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    for (const med of activeMeds) {
      const times = med.times || ["08:00 AM"]

      for (const timeStr of times) {
        const targetMinutes = parseTimeToMinutes(timeStr)
        if (targetMinutes === -1) continue

        const diff = targetMinutes - currentMinutes // in minutes

        // 1. Stage 1: 10 Minutes Prior Reminder (diff between 7 and 12 minutes)
        if (diff <= 12 && diff >= 7) {
          const key10m = `med_rem_10m_${todayStr}_${med.id}_${timeStr}`
          if (!sessionStorage.getItem(key10m)) {
            sessionStorage.setItem(key10m, "fired")

            const title = `⏰ Upcoming Medicine in 10 mins: ${med.name}`
            const message = `Please take ${med.dosage} (${med.foodInstruction}) at ${timeStr}.`

            sendBrowserNotification(title, message)

            const notif = await notificationService.createNotification({
              title,
              message,
              type: "MEDICINE_REMINDER",
              actionUrl: "/app/patient/schedule"
            })

            // Trigger Resend email reminder
            apiClient.post("/medicines/send-email-reminder", {
              medicineId: med.id,
              medicineName: med.name,
              dosage: med.dosage,
              scheduledTime: timeStr,
              foodInstruction: med.foodInstruction,
              instructions: med.instructions,
              reminderType: "10_MIN_PRIOR"
            }).catch(() => {})

            if (notif && onNewNotification) {
              onNewNotification(notif)
            }
          }
        }

        // 2. Stage 2: Exact Time / Due Now Reminder (diff between -15 and +2 minutes)
        if (diff <= 2 && diff >= -15) {
          const keyExact = `med_rem_exact_${todayStr}_${med.id}_${timeStr}`
          if (!sessionStorage.getItem(keyExact)) {
            sessionStorage.setItem(keyExact, "fired")

            const title = `💊 Time to take your medicine: ${med.name}!`
            const message = `It's ${timeStr}. Take ${med.dosage} (${med.foodInstruction}).`

            sendBrowserNotification(title, message)

            const notif = await notificationService.createNotification({
              title,
              message,
              type: "MEDICINE_REMINDER",
              actionUrl: "/app/patient/schedule"
            })

            // Trigger Resend email reminder
            apiClient.post("/medicines/send-email-reminder", {
              medicineId: med.id,
              medicineName: med.name,
              dosage: med.dosage,
              scheduledTime: timeStr,
              foodInstruction: med.foodInstruction,
              instructions: med.instructions,
              reminderType: "EXACT_TIME"
            }).catch(() => {})

            if (notif && onNewNotification) {
              onNewNotification(notif)
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Medication reminder check failed:", err)
  }
}
