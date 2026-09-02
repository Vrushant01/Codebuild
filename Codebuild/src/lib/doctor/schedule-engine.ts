/**
 * Schedule Engine — centralized slot generation and status logic.
 * 
 * Priority order (highest → lowest):
 *   LEAVE > BOOKED > UNAVAILABLE > BREAK > AVAILABLE
 * 
 * This is the SINGLE SOURCE OF TRUTH for slot status across:
 *   - Doctor schedule preview (Prompt 25)
 *   - Patient booking UI (Prompt 23)
 *   - Map availability (Prompt 22)
 */

export type SlotDisplayStatus = "AVAILABLE" | "BOOKED" | "BREAK" | "UNAVAILABLE" | "LEAVE"

export interface ScheduleSlot {
  timeStr: string          // "09:00 AM"
  time24: string           // "09:00" for comparison
  status: SlotDisplayStatus
  appointmentId?: string   // if BOOKED
  label?: string           // e.g. "Lunch Break"
}

export interface Break {
  start: string  // "HH:MM"
  end: string
  label?: string
}

export interface UnavailabilityBlock {
  date: string   // "YYYY-MM-DD"
  start: string  // "HH:MM"
  end: string
  reason?: string
}

export interface DateOverride {
  date: string
  start: string
  end: string
}

export interface BookedSlot {
  date: string
  timeStr: string // "09:30 AM"
  appointmentId: string
}

/** Convert "HH:MM" → minutes since midnight */
function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

/** Convert total minutes → "HH:MM" */
function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, "0")
  const m = (mins % 60).toString().padStart(2, "0")
  return `${h}:${m}`
}

/** Convert "HH:MM" → "09:30 AM" */
function to12Hour(t: string): string {
  const [h, m] = t.split(":").map(Number)
  const ampm = h < 12 ? "AM" : "PM"
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`
}

/**
 * generateSlots — core slot engine.
 * 
 * Future API contract:
 *   GET /api/doctors/:id/availability?date=YYYY-MM-DD
 */
export function generateSlots(opts: {
  startTime: string           // "HH:MM"
  endTime: string             // "HH:MM"
  durationMinutes: number
  breaks: Break[]
  unavailability: UnavailabilityBlock[]
  bookedSlots: BookedSlot[]
  leaveDate: boolean          // true = full day leave
  date: string                // "YYYY-MM-DD"
}): ScheduleSlot[] {
  const { startTime, endTime, durationMinutes, breaks, unavailability, bookedSlots, leaveDate, date } = opts

  const slots: ScheduleSlot[] = []
  const startMins = toMinutes(startTime)
  const endMins   = toMinutes(endTime)

  if (startMins >= endMins || durationMinutes <= 0) return []

  // If on leave, return one LEAVE marker
  if (leaveDate) {
    return [{ timeStr: "On leave", time24: "00:00", status: "LEAVE" }]
  }

  for (let cur = startMins; cur + durationMinutes <= endMins; cur += durationMinutes) {
    const time24 = fromMinutes(cur)
    const timeEnd = fromMinutes(cur + durationMinutes)
    const timeStr = to12Hour(time24)

    let status: SlotDisplayStatus = "AVAILABLE"
    let label: string | undefined
    let appointmentId: string | undefined

    // Check breaks
    for (const brk of breaks) {
      const bs = toMinutes(brk.start)
      const be = toMinutes(brk.end)
      if (cur >= bs && cur < be) {
        status = "BREAK"
        label  = brk.label || "Break"
        break
      }
    }

    // Check unavailability (overrides break)
    if (status === "BREAK" || status === "AVAILABLE") {
      for (const u of unavailability) {
        if (u.date !== date) continue
        const us = toMinutes(u.start)
        const ue = toMinutes(u.end)
        if (cur >= us && cur < ue) {
          status = "UNAVAILABLE"
          label  = u.reason || "Unavailable"
          break
        }
      }
    }

    // Check booked appointments (highest live priority)
    if (status === "AVAILABLE" || status === "BREAK") {
      const matched = bookedSlots.find(b => b.date === date && b.timeStr === timeStr)
      if (matched) {
        status = "BOOKED"
        appointmentId = matched.appointmentId
      }
    }

    slots.push({ timeStr, time24, status, label, appointmentId })
  }

  return slots
}

/**
 * detectConflicts — check for overlapping breaks / unavailability.
 * Returns list of conflict descriptions.
 */
export function detectConflicts(breaks: Break[], unavailability: UnavailabilityBlock[], workingStart: string, workingEnd: string): string[] {
  const errors: string[] = []
  const ws = toMinutes(workingStart)
  const we = toMinutes(workingEnd)

  // Validate breaks
  for (let i = 0; i < breaks.length; i++) {
    const bs = toMinutes(breaks[i].start)
    const be = toMinutes(breaks[i].end)

    if (be <= bs) { errors.push(`Break ${i + 1}: end time must be after start time.`); continue }
    if (bs < ws) errors.push(`Break ${i + 1}: starts before working hours.`)
    if (be > we) errors.push(`Break ${i + 1}: ends after working hours.`)

    for (let j = i + 1; j < breaks.length; j++) {
      const bs2 = toMinutes(breaks[j].start)
      const be2 = toMinutes(breaks[j].end)
      if (bs < be2 && be > bs2) {
        errors.push(`Break ${i + 1} and Break ${j + 1} overlap.`)
      }
    }
  }

  return errors
}

/** Count available slots */
export function countByStatus(slots: ScheduleSlot[]): Record<SlotDisplayStatus, number> {
  const counts: Record<SlotDisplayStatus, number> = { AVAILABLE: 0, BOOKED: 0, BREAK: 0, UNAVAILABLE: 0, LEAVE: 0 }
  for (const s of slots) counts[s.status]++
  return counts
}

/** Get ISO weekday from date string */
export function getWeekday(dateStr: string): "monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday" {
  const d = new Date(dateStr)
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const
  return days[d.getDay()]
}
