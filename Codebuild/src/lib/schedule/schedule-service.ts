import type { Medicine, Dose, DailySchedule, DoseStatus, MedicineStatus } from "./schedule-types"
import { apiClient } from "../api/apiClient"

class ScheduleService {
  private fallbackMedicines: Medicine[] = []

  async getMedicines(patientId?: string): Promise<Medicine[]> {
    try {
      const q = patientId ? `?patientId=${patientId}` : ""
      const res = await apiClient.get<{ success: boolean; data: any[] }>(`/medicines${q}`)
      if (res && Array.isArray(res.data)) {
        return res.data.map(m => ({
          id: m.id || m._id,
          name: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          times: m.times || ["08:00 AM"],
          foodInstruction: m.foodInstruction || "After food",
          startDate: m.startDate,
          endDate: m.endDate,
          status: m.status || "active",
          source: m.source || "PATIENT",
          prescribedBy: m.prescribedBy,
          reminderEnabled: m.reminderEnabled !== false,
          instructions: m.instructions
        }))
      }
    } catch (err) {
      console.warn("⚠️ Failed to fetch medicines from server:", err)
    }

    return []
  }

  async getMedicineHistory(): Promise<Medicine[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/medicines")
      if (res && Array.isArray(res.data)) {
        return res.data
          .filter(m => m.status === "completed" || m.status === "cancelled")
          .map(m => ({
            id: m.id || m._id,
            name: m.medicineName,
            dosage: m.dosage,
            frequency: m.frequency,
            times: m.times || ["08:00 AM"],
            foodInstruction: m.foodInstruction || "After food",
            startDate: m.startDate,
            endDate: m.endDate,
            status: m.status,
            source: m.source || "PATIENT",
            prescribedBy: m.prescribedBy,
            reminderEnabled: m.reminderEnabled !== false,
            instructions: m.instructions
          }))
      }
    } catch {}

    return this.fallbackMedicines.filter(m => m.status === "completed" || m.status === "cancelled")
  }

  async getDailySchedule(dateStr: string): Promise<DailySchedule> {
    const medicines = await this.getMedicines()
    const activeMeds = medicines.filter(m => m.status === "active")

    const doses: (Dose & { medicine: Medicine })[] = []

    activeMeds.forEach(med => {
      (med.times || ["08:00 AM"]).forEach((timeStr, idx) => {
        doses.push({
          id: `${med.id}_${idx}`,
          medicineId: med.id,
          date: dateStr,
          scheduledTime: timeStr,
          status: "upcoming",
          medicine: med
        })
      })
    })

    const completed = doses.filter(d => d.status === "taken").length

    return {
      date: dateStr,
      doses,
      completedCount: completed,
      totalCount: doses.length
    }
  }

  async getUpcomingDose(dateStr?: string): Promise<(Dose & { medicine: Medicine }) | null> {
    const targetDate = dateStr || new Date().toISOString().split("T")[0]
    const sched = await this.getDailySchedule(targetDate)
    const upcoming = sched.doses.find(d => d.status === "upcoming" || d.status === "due")
    return upcoming || null
  }

  async addMedicine(medicine: Omit<Medicine, "id" | "status">): Promise<Medicine> {
    try {
      const res = await apiClient.post<{ success: boolean; data: any }>("/medicines", {
        medicineName: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        times: medicine.times,
        foodInstruction: medicine.foodInstruction,
        startDate: medicine.startDate,
        endDate: medicine.endDate,
        instructions: medicine.instructions,
        reminderEnabled: medicine.reminderEnabled,
        prescribedBy: medicine.prescribedBy
      })

      if (res && res.data) {
        const m = res.data
        return {
          id: m.id || m._id,
          name: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          times: m.times,
          foodInstruction: m.foodInstruction,
          startDate: m.startDate,
          endDate: m.endDate,
          status: m.status || "active",
          source: m.source || "PATIENT",
          prescribedBy: m.prescribedBy,
          reminderEnabled: m.reminderEnabled,
          instructions: m.instructions
        }
      }
    } catch (err: any) {
      console.warn("⚠️ Fallback to local medicine addition:", err)
    }

    const newMed: Medicine = {
      ...medicine,
      id: `med_${Date.now()}`,
      status: "active"
    }
    this.fallbackMedicines.push(newMed)
    return newMed
  }

  async updateMedicine(medicineId: string, medicine: Partial<Medicine>): Promise<Medicine | null> {
    try {
      const res = await apiClient.put<{ success: boolean; data: any }>(`/medicines/${medicineId}`, {
        medicineName: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        times: medicine.times,
        foodInstruction: medicine.foodInstruction,
        startDate: medicine.startDate,
        endDate: medicine.endDate,
        instructions: medicine.instructions,
        reminderEnabled: medicine.reminderEnabled,
        status: medicine.status
      })

      if (res && res.data) {
        const m = res.data
        return {
          id: m.id || m._id,
          name: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          times: m.times,
          foodInstruction: m.foodInstruction,
          startDate: m.startDate,
          endDate: m.endDate,
          status: m.status || "active",
          source: m.source || "PATIENT",
          prescribedBy: m.prescribedBy,
          reminderEnabled: m.reminderEnabled,
          instructions: m.instructions
        }
      }
    } catch (err: any) {
      console.warn("⚠️ Failed to update medicine on server:", err)
    }

    return null
  }

  async markDoseTaken(doseId: string): Promise<void> {
    await this.markDoseStatus(doseId, "taken")
  }

  async markDoseStatus(doseId: string, status: DoseStatus): Promise<void> {
    try {
      const [medicineId] = doseId.split("_")
      const todayStr = new Date().toISOString().split("T")[0]
      await apiClient.post(`/medicines/${medicineId}/dose`, {
        date: todayStr,
        scheduledTime: "08:00 AM",
        status
      })
    } catch (err) {}
  }

  async toggleReminder(medicineId: string, enabled?: boolean): Promise<void> {
    try {
      const meds = await this.getMedicines()
      const med = meds.find(m => m.id === medicineId)
      if (med) {
        const newVal = enabled !== undefined ? enabled : !med.reminderEnabled
        await apiClient.patch(`/medicines/${medicineId}/status`, { reminderEnabled: newVal })
      }
    } catch {}
  }

  async deleteMedicine(medicineId: string): Promise<void> {
    try {
      await apiClient.patch(`/medicines/${medicineId}/status`, { status: "cancelled" })
    } catch {
      this.fallbackMedicines = this.fallbackMedicines.filter(m => m.id !== medicineId)
    }
  }

  async restoreMedicine(medicineId: string): Promise<void> {
    try {
      await apiClient.patch(`/medicines/${medicineId}/status`, { status: "active" })
    } catch (err) {
      console.warn("⚠️ Failed to restore medicine to active schedule:", err)
    }
  }

  async permanentDeleteMedicine(medicineId: string): Promise<void> {
    try {
      await apiClient.delete(`/medicines/${medicineId}`)
    } catch (err) {
      console.warn("⚠️ Failed to permanently delete medicine:", err)
    }
  }

  async updateMedicineStatus(medicineId: string, status: MedicineStatus): Promise<void> {
    try {
      await apiClient.patch(`/medicines/${medicineId}/status`, { status })
    } catch (err) {
      console.warn("⚠️ Failed to update medicine status on server:", err)
    }
  }
}

export const scheduleService = new ScheduleService()
