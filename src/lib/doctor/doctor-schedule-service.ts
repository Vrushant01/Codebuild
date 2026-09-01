import type { Break, UnavailabilityBlock, DateOverride, BookedSlot } from "./schedule-engine"

export interface WorkingDays {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export interface DayHours {
  start: string  // "HH:MM"
  end: string
}

export interface FullScheduleConfig {
  doctorId: string
  workingDays: WorkingDays
  // Per-day overrides for start/end (if null, uses defaultHours)
  dayHours: Partial<Record<keyof WorkingDays, DayHours>>
  defaultHours: DayHours
  appointmentDurationMinutes: number
  breaks: Break[]
  unavailability: UnavailabilityBlock[]
  leaves: string[]  // ISO date strings, full-day leave
  leaveRanges: Array<{ start: string; end: string; reason?: string }>
  dateOverrides: DateOverride[]
}

const mockDelay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Default Schedule ─────────────────────────────────────────────────────────
const DEFAULT_CONFIG: FullScheduleConfig = {
  doctorId: "doc_1",
  workingDays: {
    monday: true, tuesday: true, wednesday: true,
    thursday: true, friday: true, saturday: true, sunday: false
  },
  dayHours: {
    saturday: { start: "09:00", end: "13:00" }
  },
  defaultHours: { start: "09:00", end: "17:00" },
  appointmentDurationMinutes: 30,
  breaks: [
    { start: "13:00", end: "14:00", label: "Lunch break" }
  ],
  unavailability: [],
  leaves: [],
  leaveRanges: [],
  dateOverrides: []
}

let LIVE_CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as FullScheduleConfig
let SAVED_CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as FullScheduleConfig

class ScheduleService {

  // ── Read ────────────────────────────────────────────────────────────────────
  async getConfig(): Promise<FullScheduleConfig> {
    await mockDelay(300)
    return JSON.parse(JSON.stringify(LIVE_CONFIG))
  }

  getSavedConfig(): FullScheduleConfig {
    return JSON.parse(JSON.stringify(SAVED_CONFIG))
  }

  /** Get effective hours for a given day key */
  getEffectiveHours(config: FullScheduleConfig, day: keyof WorkingDays): DayHours {
    return config.dayHours[day] || config.defaultHours
  }

  /** Get effective hours for a specific date, respecting date overrides */
  getHoursForDate(config: FullScheduleConfig, dateStr: string): DayHours | null {
    // Check date override first
    const override = config.dateOverrides.find(o => o.date === dateStr)
    if (override) return { start: override.start, end: override.end }

    // Check if on leave
    if (this.isOnLeave(config, dateStr)) return null

    // Check weekly working day
    const d = new Date(dateStr)
    const dayNames: (keyof WorkingDays)[] = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
    const dayKey = dayNames[d.getDay()]
    if (!config.workingDays[dayKey]) return null

    return config.dayHours[dayKey] || config.defaultHours
  }

  isOnLeave(config: FullScheduleConfig, dateStr: string): boolean {
    if (config.leaves.includes(dateStr)) return true
    for (const r of config.leaveRanges) {
      if (dateStr >= r.start && dateStr <= r.end) return true
    }
    return false
  }

  // ── Write ───────────────────────────────────────────────────────────────────
  async saveConfig(config: FullScheduleConfig): Promise<void> {
    await mockDelay(700)
    // Simulate occasional error (10% chance)
    if (Math.random() < 0.05) {
      throw new Error("Schedule couldn't be saved. Please try again.")
    }
    LIVE_CONFIG  = JSON.parse(JSON.stringify(config))
    SAVED_CONFIG = JSON.parse(JSON.stringify(config))
  }

  async addLeave(date: string, reason?: string): Promise<void> {
    await mockDelay(300)
    if (!LIVE_CONFIG.leaves.includes(date)) {
      LIVE_CONFIG.leaves.push(date)
    }
  }

  async addLeaveRange(start: string, end: string, reason?: string): Promise<void> {
    await mockDelay(300)
    LIVE_CONFIG.leaveRanges.push({ start, end, reason })
  }

  async removeLeave(date: string): Promise<void> {
    await mockDelay(200)
    LIVE_CONFIG.leaves = LIVE_CONFIG.leaves.filter(l => l !== date)
  }

  async addUnavailability(block: UnavailabilityBlock): Promise<void> {
    await mockDelay(300)
    LIVE_CONFIG.unavailability.push(block)
  }

  async removeUnavailability(idx: number): Promise<void> {
    await mockDelay(200)
    LIVE_CONFIG.unavailability.splice(idx, 1)
  }

  async addDateOverride(override: DateOverride): Promise<void> {
    await mockDelay(300)
    const existing = LIVE_CONFIG.dateOverrides.findIndex(o => o.date === override.date)
    if (existing >= 0) LIVE_CONFIG.dateOverrides[existing] = override
    else LIVE_CONFIG.dateOverrides.push(override)
  }

  async removeDateOverride(date: string): Promise<void> {
    await mockDelay(200)
    LIVE_CONFIG.dateOverrides = LIVE_CONFIG.dateOverrides.filter(o => o.date !== date)
  }

  // ── Booked Slots from appointments ──────────────────────────────────────────
  async getBookedSlots(): Promise<BookedSlot[]> {
    // Import dynamically to avoid circular dep
    const { doctorService } = await import("./doctor-service")
    const apts = await doctorService.getAppointments()
    return apts
      .filter(a => a.status === "CONFIRMED" || a.status === "BOOKED" || a.status === "ACCEPTED" || a.status === "PENDING")
      .map(a => ({ date: a.date, timeStr: a.timeStr, appointmentId: a.id }))
  }

  /** Future API: GET /api/doctors/:id/schedule */
  async legacyGetConfig() { return this.getConfig() }
  /** Future API: PATCH /api/doctors/:id/schedule */
  async legacyUpdateConfig(c: FullScheduleConfig) { return this.saveConfig(c) }
  /** Future API: GET /api/doctors/:id/availability */
  async legacyGetAvailability(dateStr: string) { return this.getHoursForDate(LIVE_CONFIG, dateStr) }
}

export const scheduleService = new ScheduleService()
