import type { Break, UnavailabilityBlock, DateOverride, BookedSlot } from "./schedule-engine"
import type { GeneratedSlot } from "./doctor-types"
import { apiClient } from "../api/apiClient"

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
  dayHours: Partial<Record<keyof WorkingDays, DayHours>>
  defaultHours: DayHours
  appointmentDurationMinutes: number
  breaks: Break[]
  unavailability: UnavailabilityBlock[]
  leaves: string[]  // ISO date strings, full-day leave
  leaveRanges: Array<{ start: string; end: string; reason?: string }>
  dateOverrides: DateOverride[]
}

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
    try {
      const res = await apiClient.get<{ success: boolean; data: FullScheduleConfig }>("/doctors/me/schedule")
      if (res && res.data) {
        LIVE_CONFIG = JSON.parse(JSON.stringify(res.data))
        SAVED_CONFIG = JSON.parse(JSON.stringify(res.data))
        return JSON.parse(JSON.stringify(res.data))
      }
    } catch (err) {
      console.warn("⚠️ Error fetching schedule from server, using local fallback:", err)
    }

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
    const override = config.dateOverrides?.find(o => o.date === dateStr)
    if (override) return { start: override.start, end: override.end }

    if (this.isOnLeave(config, dateStr)) return null

    const d = new Date(dateStr)
    const dayNames: (keyof WorkingDays)[] = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
    const dayKey = dayNames[d.getDay()]
    if (!config.workingDays || !config.workingDays[dayKey]) return null

    return config.dayHours?.[dayKey] || config.defaultHours
  }

  isOnLeave(config: FullScheduleConfig, dateStr: string): boolean {
    if (config.leaves?.includes(dateStr)) return true
    for (const r of (config.leaveRanges || [])) {
      if (dateStr >= r.start && dateStr <= r.end) return true
    }
    return false
  }

  // ── Write ───────────────────────────────────────────────────────────────────
  async saveConfig(config: FullScheduleConfig): Promise<void> {
    try {
      const res = await apiClient.put<{ success: boolean; message: string; data: any }>("/doctors/me/schedule", config)
      if (res && res.success) {
        LIVE_CONFIG  = JSON.parse(JSON.stringify(config))
        SAVED_CONFIG = JSON.parse(JSON.stringify(config))
        return
      }
    } catch (err: any) {
      console.error("❌ Failed to save schedule to server:", err)
      throw new Error(err.message || "Schedule couldn't be saved. Please try again.")
    }

    LIVE_CONFIG  = JSON.parse(JSON.stringify(config))
    SAVED_CONFIG = JSON.parse(JSON.stringify(config))
  }

  async addLeave(date: string, reason?: string): Promise<void> {
    if (!LIVE_CONFIG.leaves) LIVE_CONFIG.leaves = []
    if (!LIVE_CONFIG.leaves.includes(date)) {
      LIVE_CONFIG.leaves.push(date)
    }
  }

  async addLeaveRange(start: string, end: string, reason?: string): Promise<void> {
    if (!LIVE_CONFIG.leaveRanges) LIVE_CONFIG.leaveRanges = []
    LIVE_CONFIG.leaveRanges.push({ start, end, reason })
  }

  async removeLeave(date: string): Promise<void> {
    if (LIVE_CONFIG.leaves) {
      LIVE_CONFIG.leaves = LIVE_CONFIG.leaves.filter(l => l !== date)
    }
  }

  async addUnavailability(block: UnavailabilityBlock): Promise<void> {
    if (!LIVE_CONFIG.unavailability) LIVE_CONFIG.unavailability = []
    LIVE_CONFIG.unavailability.push(block)
  }

  async removeUnavailability(idx: number): Promise<void> {
    if (LIVE_CONFIG.unavailability) {
      LIVE_CONFIG.unavailability.splice(idx, 1)
    }
  }

  async addDateOverride(override: DateOverride): Promise<void> {
    if (!LIVE_CONFIG.dateOverrides) LIVE_CONFIG.dateOverrides = []
    const existing = LIVE_CONFIG.dateOverrides.findIndex(o => o.date === override.date)
    if (existing >= 0) LIVE_CONFIG.dateOverrides[existing] = override
    else LIVE_CONFIG.dateOverrides.push(override)
  }

  async removeDateOverride(date: string): Promise<void> {
    if (LIVE_CONFIG.dateOverrides) {
      LIVE_CONFIG.dateOverrides = LIVE_CONFIG.dateOverrides.filter(o => o.date !== date)
    }
  }

  async getBookedSlots(): Promise<BookedSlot[]> {
    try {
      const { doctorService } = await import("./doctor-service")
      const apts = await doctorService.getAppointments()
      return apts
        .filter(a => a.status === "CONFIRMED" || a.status === "ACCEPTED" || a.status === "PENDING")
        .map(a => ({ date: a.date, timeStr: a.timeStr, appointmentId: a.id }))
    } catch {
      return []
    }
  }

  async generateSlots(dateStr: string): Promise<GeneratedSlot[]> {
    const defaultTimes = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"]
    return defaultTimes.map((timeStr, idx) => ({
      timeStr,
      status: idx === 2 ? "Booked" : idx === 5 ? "Break" : "Available"
    }))
  }

  async updateConfig(config: any): Promise<void> {
    await this.saveConfig(config)
  }
}

export const scheduleService = new ScheduleService()
export const doctorScheduleService = scheduleService
