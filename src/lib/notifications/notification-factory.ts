import type { AppNotification } from "./notification-types"
import { NotificationType } from "./notification-types"

let mockIdCounter = 1
const generateId = () => `notif_${mockIdCounter++}_${Date.now()}`

const getRelativeTimeStr = (minutesAgo: number) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - minutesAgo)
  return d.toISOString()
}

export const notificationFactory = {
  // --- 4 Appointment Notifications ---
  appointmentConfirmed: (userId: string, minutesAgo = 10, read = false): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.APPOINTMENT_CONFIRMED,
    title: "Appointment confirmed",
    message: "Your appointment with Dr. Aarav Patel is confirmed for 10 Sep at 10:30 AM.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "APPOINTMENT",
    entityId: "apt-1",
    actionLabel: "View appointment"
  }),
  appointmentReminder: (userId: string, minutesAgo = 60, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.APPOINTMENT_REMINDER,
    title: "Appointment reminder",
    message: "Don't forget your appointment with Dr. Sharma tomorrow.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "APPOINTMENT",
    entityId: "apt-2",
    actionLabel: "View appointment"
  }),
  appointmentCancelled: (userId: string, minutesAgo = 1440, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.APPOINTMENT_CANCELLED,
    title: "Appointment cancelled",
    message: "Your appointment with Dr. Desai has been cancelled by the clinic.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "APPOINTMENT",
    entityId: "apt-3",
    actionLabel: "View details"
  }),
  appointmentRejected: (userId: string, minutesAgo = 2880, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.APPOINTMENT_REJECTED,
    title: "Appointment request declined",
    message: "We're sorry, Dr. Patel is unavailable at your requested time.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "APPOINTMENT",
    entityId: "apt-4",
    actionLabel: "Book new time"
  }),

  // --- 3 Medicine Notifications ---
  medicineReminder: (userId: string, minutesAgo = 0, read = false): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.MEDICINE_REMINDER,
    title: "Medicine reminder",
    message: "Paracetamol — 500 mg. It's time for your scheduled medicine.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "MEDICINE",
    entityId: "med-1",
    actionLabel: "View schedule"
  }),
  medicineUpdated: (userId: string, minutesAgo = 4320, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.MEDICINE_UPDATED,
    title: "Medicine schedule updated",
    message: "Dr. Patel updated your dosage for Amlodipine.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "MEDICINE",
    entityId: "med-2",
    actionLabel: "View updates"
  }),
  medicineCompleted: (userId: string, minutesAgo = 5760, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.MEDICINE_COMPLETED,
    title: "Medicine course completed",
    message: "You have completed your 7-day course of Amoxicillin.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "MEDICINE",
    entityId: "med-3"
  }),

  // --- 2 Feedback Notifications ---
  feedbackAvailable: (userId: string, minutesAgo = 120, read = false): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.FEEDBACK_AVAILABLE,
    title: "Feedback available",
    message: "Your appointment is complete. Share your experience.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "REVIEW",
    entityId: "apt-1",
    actionLabel: "Leave feedback"
  }),
  feedbackVerified: (userId: string, minutesAgo = 10080, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.FEEDBACK_VERIFIED,
    title: "Your feedback has been verified",
    message: "Your review for CityCare Clinic has been successfully verified.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "REVIEW",
    entityId: "rev-1",
    actionLabel: "View feedback"
  }),

  // --- 2 Telemedicine / Follow-up ---
  telemedicineStarting: (userId: string, minutesAgo = 5, read = false): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.TELEMEDICINE_STARTING_SOON,
    title: "Consultation starting soon",
    message: "Your online appointment starts in 10 minutes.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "TELEMEDICINE",
    entityId: "apt-5",
    actionLabel: "Join consultation"
  }),
  followUpConfirmed: (userId: string, minutesAgo = 20160, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.FOLLOW_UP_CONFIRMED,
    title: "Follow-up appointment confirmed",
    message: "Your follow-up with Dr. Patel is scheduled for next week.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "FOLLOW_UP",
    entityId: "apt-6",
    actionLabel: "View details"
  }),

  // --- 1 System Notification ---
  systemInfo: (userId: string, minutesAgo = 40320, read = true): AppNotification => ({
    id: generateId(), userId,
    type: NotificationType.SYSTEM_INFO,
    title: "Welcome to Medireach",
    message: "Your profile has been successfully created. Keep it updated for better care.",
    createdAt: getRelativeTimeStr(minutesAgo),
    read,
    entityType: "SYSTEM",
    actionLabel: "View profile"
  }),
}
