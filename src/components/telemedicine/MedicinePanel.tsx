import React, { useState } from "react"
import { Button } from "../ui/button"
import { Pill, Plus, CheckCircle2 } from "lucide-react"
import { scheduleService } from "../../lib/schedule/schedule-service"
import { useNotifications } from "../../lib/notifications/NotificationContext"
import { NotificationType, NotificationCategory } from "../../lib/notifications/notification-types"
import type { FoodInstruction } from "../../lib/schedule/schedule-types"

export function MedicinePanel({ doctorName, patientId }: { doctorName: string, patientId: string }) {
  const { simulateNotification } = useNotifications()
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "Twice daily",
    foodInstruction: "After food" as FoodInstruction,
    durationDays: 5,
  })
  const [adding, setAdding] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.dosage) return
    
    setAdding(true)
    
    // Simulate times based on frequency
    const times = form.frequency === "Once daily" ? ["08:00 AM"] :
                  form.frequency === "Twice daily" ? ["08:00 AM", "08:00 PM"] :
                  ["08:00 AM", "01:00 PM", "08:00 PM"]
    
    await scheduleService.addMedicine({
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency,
      foodInstruction: form.foodInstruction,
      durationDays: form.durationDays,
      startDate: new Date().toISOString().split("T")[0],
      prescribedBy: doctorName,
    }, times)

    // Send notification to patient
    simulateNotification({
      id: `med_notif_${Date.now()}`,
      userId: patientId,
      type: NotificationType.SYSTEM as any,
      title: "New medicine added",
      message: `Dr. ${doctorName} added a new medicine to your schedule.`,
      createdAt: new Date().toISOString(),
      read: false
    })

    setAdding(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setForm({
        name: "",
        dosage: "",
        frequency: "Twice daily",
        foodInstruction: "After food",
        durationDays: 5,
      })
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full bg-card border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/30 shrink-0">
        <h3 className="font-semibold flex items-center gap-2">
          <Pill className="w-4 h-4 text-primary" />
          Add Medicine
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medicine Name</label>
          <input 
            type="text"
            className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="E.g. Paracetamol"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dosage</label>
          <input 
            type="text"
            className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="E.g. 500 mg"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</label>
          <select 
            className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option value="Once daily">Once daily</option>
            <option value="Twice daily">Twice daily</option>
            <option value="Thrice daily">Thrice daily</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Food Instruction</label>
          <select 
            className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={form.foodInstruction}
            onChange={(e) => setForm({ ...form, foodInstruction: e.target.value as FoodInstruction })}
          >
            <option value="Before food">Before food</option>
            <option value="After food">After food</option>
            <option value="With food">With food</option>
            <option value="Any time">Any time</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration (Days)</label>
          <input 
            type="number"
            min="1"
            max="365"
            className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={form.durationDays}
            onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="p-4 border-t bg-background shrink-0">
        <Button 
          className="w-full shadow-sm" 
          onClick={handleSubmit} 
          disabled={adding || !form.name || !form.dosage}
        >
          {adding ? (
            "Adding..."
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Added
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Add to Patient Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
