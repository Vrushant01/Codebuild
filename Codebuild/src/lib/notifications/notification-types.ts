export const NotificationType = {
  // Appointment
  APPOINTMENT_CONFIRMED: "APPOINTMENT_CONFIRMED",
  APPOINTMENT_REJECTED: "APPOINTMENT_REJECTED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER",
  APPOINTMENT_RESCHEDULED: "APPOINTMENT_RESCHEDULED",

  // Medicine
  MEDICINE_REMINDER: "MEDICINE_REMINDER",
  MEDICINE_UPDATED: "MEDICINE_UPDATED",
  MEDICINE_COMPLETED: "MEDICINE_COMPLETED",

  // Feedback
  FEEDBACK_AVAILABLE: "FEEDBACK_AVAILABLE",
  FEEDBACK_SUBMITTED: "FEEDBACK_SUBMITTED",
  FEEDBACK_VERIFIED: "FEEDBACK_VERIFIED",

  // Telemedicine
  TELEMEDICINE_STARTING_SOON: "TELEMEDICINE_STARTING_SOON",
  TELEMEDICINE_JOIN: "TELEMEDICINE_JOIN",

  // Follow-up
  FOLLOW_UP_REQUESTED: "FOLLOW_UP_REQUESTED",
  FOLLOW_UP_CONFIRMED: "FOLLOW_UP_CONFIRMED",

  // System
  SYSTEM_PROFILE_UPDATE: "SYSTEM_PROFILE_UPDATE",
  SYSTEM_INFO: "SYSTEM_INFO",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationCategory = {
  ALL: "ALL",
  UNREAD: "UNREAD",
  APPOINTMENTS: "APPOINTMENTS",
  MEDICINES: "MEDICINES",
  FEEDBACK: "FEEDBACK",
  SYSTEM: "SYSTEM"
} as const;

export type NotificationCategory = typeof NotificationCategory[keyof typeof NotificationCategory];

export interface AppNotification {
  id: string
  userId: string 
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  actionUrl?: string
  metadata?: any
  
  // Specific entity linking
  entityType?: "APPOINTMENT" | "MEDICINE" | "REVIEW" | "TELEMEDICINE" | "FOLLOW_UP" | "SYSTEM"
  entityId?: string
  actionLabel?: string
}

export interface NotificationPreferences {
  appointmentUpdates: boolean
  medicineReminders: boolean
  feedbackUpdates: boolean
  telemedicineReminders: boolean
}
