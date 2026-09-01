import type { Medicine, Dose, DailySchedule, DoseStatus, MedicineStatus } from "./schedule-types"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class ScheduleService {
  private medicines: Medicine[] = []
  private doses: Dose[] = []

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    
    const med1: Medicine = {
      id: "med_1",
      name: "Paracetamol",
      dosage: "500 mg",
      frequency: "Twice daily",
      times: ["08:00 AM", "08:00 PM"],
      foodInstruction: "After food",
      startDate: todayStr,
      endDate: "2026-09-14",
      status: "active",
      source: "DOCTOR",
      prescribedBy: "Dr. Aarav Patel",
      reminderEnabled: true,
      instructions: "Take with water"
    }

    const med2: Medicine = {
      id: "med_2",
      name: "Vitamin D3",
      dosage: "1 tablet",
      frequency: "Once weekly",
      times: ["08:00 AM"],
      foodInstruction: "With food",
      startDate: todayStr,
      status: "active",
      source: "PATIENT",
      reminderEnabled: true
    }

    const med3: Medicine = {
      id: "med_3",
      name: "Amoxicillin",
      dosage: "1 capsule",
      frequency: "Three times daily",
      times: ["08:00 AM", "01:00 PM", "08:00 PM"],
      foodInstruction: "Before food",
      startDate: "2026-08-20",
      endDate: "2026-08-27",
      status: "completed",
      source: "DOCTOR",
      prescribedBy: "Dr. Aarav Patel",
      reminderEnabled: false
    }

    this.medicines = [med1, med2, med3]

    // Create doses for today
    this.doses = [
      {
        id: "dose_1",
        medicineId: "med_1",
        date: todayStr,
        scheduledTime: "08:00 AM",
        status: "taken",
        takenAt: new Date(today.setHours(8, 5, 0, 0)).toISOString()
      },
      {
        id: "dose_2",
        medicineId: "med_2",
        date: todayStr,
        scheduledTime: "01:00 PM",
        status: "upcoming"
      },
      {
        id: "dose_3",
        medicineId: "med_1",
        date: todayStr,
        scheduledTime: "08:00 PM",
        status: "upcoming"
      }
    ]
  }

  async getMedicines(): Promise<Medicine[]> {
    await mockDelay(200)
    return [...this.medicines]
  }

  async getMedicineHistory(): Promise<Medicine[]> {
    await mockDelay(200)
    return this.medicines.filter(m => m.status === "completed" || m.status === "cancelled")
  }

  async getDailySchedule(dateStr: string): Promise<DailySchedule> {
    await mockDelay(400)

    const dayDoses = this.doses.filter(d => d.date === dateStr)
    const enrichedDoses = dayDoses.map(dose => {
      const medicine = this.medicines.find(m => m.id === dose.medicineId)!
      return { ...dose, medicine }
    }).filter(d => d.medicine).sort((a, b) => {
      const parseTime = (t: string) => {
        const [time, modifier] = t.split(" ")
        let [hours, minutes] = time.split(":")
        if (hours === "12") hours = "00"
        if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString()
        return parseInt(hours + minutes, 10)
      }
      return parseTime(a.scheduledTime) - parseTime(b.scheduledTime)
    })

    const completedCount = enrichedDoses.filter(d => d.status === "taken").length

    return {
      date: dateStr,
      doses: enrichedDoses,
      completedCount,
      totalCount: enrichedDoses.length
    }
  }

  async getUpcomingDose(dateStr: string) {
    const schedule = await this.getDailySchedule(dateStr)
    return schedule.doses.find(d => d.status === "upcoming" || d.status === "due") || null
  }

  async markDoseTaken(doseId: string): Promise<void> {
    await mockDelay(300)
    const dose = this.doses.find(d => d.id === doseId)
    if (dose) {
      dose.status = "taken"
      dose.takenAt = new Date().toISOString()
    }
  }

  async markDoseMissed(doseId: string): Promise<void> {
    await mockDelay(300)
    const dose = this.doses.find(d => d.id === doseId)
    if (dose) {
      dose.status = "missed"
    }
  }

  async addMedicine(medicine: Omit<Medicine, "id" | "status">): Promise<void> {
    await mockDelay(600)
    const newMed: Medicine = {
      ...medicine,
      id: `med_${Math.random().toString(36).substr(2, 9)}`,
      status: "active"
    }
    this.medicines.push(newMed)

    // Generate upcoming doses for today/future for mock purposes
    const todayStr = new Date().toISOString().split("T")[0]
    medicine.times.forEach(time => {
      this.doses.push({
        id: `dose_${Math.random().toString(36).substr(2, 9)}`,
        medicineId: newMed.id,
        date: todayStr,
        scheduledTime: time,
        status: "upcoming"
      })
    })
  }
  
  async updateMedicine(id: string, updates: Partial<Medicine>): Promise<void> {
    await mockDelay(300)
    const index = this.medicines.findIndex(m => m.id === id)
    if (index !== -1) {
      this.medicines[index] = { ...this.medicines[index], ...updates }
    }
  }

  async deleteMedicine(id: string): Promise<void> {
    await mockDelay(300)
    const index = this.medicines.findIndex(m => m.id === id)
    if (index !== -1) {
      this.medicines.splice(index, 1)
      this.doses = this.doses.filter(d => d.medicineId !== id)
    }
  }

  // Reminder toggles
  async toggleReminder(medicineId: string, enabled: boolean): Promise<void> {
    await mockDelay(200)
    const med = this.medicines.find(m => m.id === medicineId)
    if (med) med.reminderEnabled = enabled
  }
}

export const scheduleService = new ScheduleService()
