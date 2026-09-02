/**
 * Utility to accurately calculate if an appointment's video consultation window is ready.
 */

export interface MeetingTimeCheckResult {
  status: "READY" | "EARLY" | "FUTURE_DATE" | "PASSED"
  isReady: boolean
  isToday: boolean
  timeStr: string
  dateStr: string
  message: string
  minutesUntilStart: number
}

export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const [year, month, day] = dateStr.split("-").map(Number)
    if (!year || !month || !day) return null

    // Parse time string e.g. "10:00 AM", "09:30 AM", "02:00 PM"
    let hours = 10
    let minutes = 0

    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
    if (match) {
      let h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      const meridiem = (match[3] || "").toUpperCase()

      if (meridiem === "PM" && h < 12) h += 12
      if (meridiem === "AM" && h === 12) h = 0

      hours = h
      minutes = m
    }

    const apptDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
    return apptDate
  } catch {
    return null
  }
}

export function checkMeetingTimeStatus(dateStr: string, timeStr: string): MeetingTimeCheckResult {
  const now = new Date()
  const todayDateStr = now.toISOString().split("T")[0]
  const isToday = dateStr === todayDateStr

  const apptDate = parseAppointmentDateTime(dateStr, timeStr)

  if (!apptDate) {
    return {
      status: "READY",
      isReady: true,
      isToday,
      timeStr,
      dateStr,
      message: `Meeting ready for ${timeStr}`,
      minutesUntilStart: 0
    }
  }

  // Future Date (e.g. tomorrow or next week)
  if (dateStr > todayDateStr) {
    const daysDiff = Math.ceil((new Date(dateStr).getTime() - new Date(todayDateStr).getTime()) / (1000 * 60 * 60 * 24))
    return {
      status: "FUTURE_DATE",
      isReady: false,
      isToday: false,
      timeStr,
      dateStr,
      message: `This consultation is scheduled on ${dateStr} at ${timeStr} (${daysDiff} day${daysDiff > 1 ? "s" : ""} away).`,
      minutesUntilStart: daysDiff * 24 * 60
    }
  }

  // Past Date
  if (dateStr < todayDateStr) {
    return {
      status: "PASSED",
      isReady: false,
      isToday: false,
      timeStr,
      dateStr,
      message: `This appointment date (${dateStr}) has already passed.`,
      minutesUntilStart: -999
    }
  }

  // TODAY: Calculate minute difference
  const diffMs = apptDate.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  // If more than 15 minutes before scheduled start time
  if (diffMinutes > 15) {
    return {
      status: "EARLY",
      isReady: false,
      isToday: true,
      timeStr,
      dateStr,
      message: `This consultation is scheduled for Today at ${timeStr}. Meeting window opens 15 minutes prior to start time.`,
      minutesUntilStart: diffMinutes
    }
  }

  // If within 15 minutes before or up to 60 minutes after start time
  if (diffMinutes >= -60) {
    return {
      status: "READY",
      isReady: true,
      isToday: true,
      timeStr,
      dateStr,
      message: `Consultation is active now for ${timeStr}.`,
      minutesUntilStart: diffMinutes
    }
  }

  // More than 1 hour past scheduled time
  return {
    status: "PASSED",
    isReady: false,
    isToday: true,
    timeStr,
    dateStr,
    message: `The scheduled consultation time (${timeStr}) has concluded.`,
    minutesUntilStart: diffMinutes
  }
}
