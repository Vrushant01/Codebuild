import React, { useState } from "react"
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "../ui/button"

export interface MedicineFormData {
  name: string
  dosage: string
  frequency: string
  times: string[]
  foodInstruction: string
  startDate: string
  endDate: string
  instructions: string
  reminderEnabled: boolean
}

interface AddMedicineFormProps {
  initialData?: Partial<MedicineFormData>
  isDoctorView?: boolean
  saving?: boolean
  onSave: (data: MedicineFormData) => void
  onCancel: () => void
}

export function AddMedicineForm({ initialData, isDoctorView, saving, onSave, onCancel }: AddMedicineFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [dosage, setDosage] = useState(initialData?.dosage || "")
  const [frequency, setFrequency] = useState(initialData?.frequency || "Once daily")
  const [times, setTimes] = useState<string[]>(initialData?.times || ["08:00 AM"])
  const [foodInstruction, setFoodInstruction] = useState(initialData?.foodInstruction || "After food")
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(initialData?.endDate || "")
  const [instructions, setInstructions] = useState(initialData?.instructions || "")
  const [reminderEnabled, setReminderEnabled] = useState(initialData?.reminderEnabled ?? true)

  const handleAddTime = () => {
    setTimes([...times, "12:00 PM"])
  }

  const handleRemoveTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index))
  }

  const handleTimeChange = (index: number, val: string) => {
    const newTimes = [...times]
    newTimes[index] = val
    setTimes(newTimes)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      dosage,
      frequency,
      times,
      foodInstruction,
      startDate,
      endDate,
      instructions,
      reminderEnabled
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">Medicine Name</label>
          <input 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Paracetamol"
            className="w-full bg-background border rounded-xl px-4 py-2.5"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">Dosage</label>
          <input 
            required
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="e.g. 500mg, 1 tablet"
            className="w-full bg-background border rounded-xl px-4 py-2.5"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">Frequency</label>
          <select 
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            className="w-full bg-background border rounded-xl px-4 py-2.5"
          >
            <option>Once daily</option>
            <option>Twice daily</option>
            <option>Three times daily</option>
            <option>Once weekly</option>
            <option>As needed</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">Timing</label>
          <div className="space-y-2">
            {times.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input 
                  type="time"
                  required
                  value={(() => {
                     // convert 08:00 AM to 08:00
                     try {
                        const [time, mod] = t.split(" ");
                        let [h, m] = time.split(":");
                        if (mod === "PM" && h !== "12") h = (parseInt(h) + 12).toString().padStart(2, "0");
                        if (mod === "AM" && h === "12") h = "00";
                        return `${h}:${m}`;
                     } catch(e) { return "08:00" }
                  })()}
                  onChange={e => {
                     const [h, m] = e.target.value.split(":");
                     let hr = parseInt(h);
                     const ampm = hr >= 12 ? "PM" : "AM";
                     hr = hr % 12;
                     if (hr === 0) hr = 12;
                     handleTimeChange(idx, `${hr.toString().padStart(2, "0")}:${m} ${ampm}`);
                  }}
                  className="bg-background border rounded-xl px-4 py-2.5 flex-1"
                />
                {times.length > 1 && (
                  <button type="button" onClick={() => handleRemoveTime(idx)} className="p-2.5 text-muted-foreground hover:text-destructive bg-muted rounded-xl">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddTime} className="text-sm font-semibold text-primary flex items-center gap-1 mt-1">
              <Plus className="w-4 h-4" /> Add time
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">Food Instruction</label>
          <select 
            value={foodInstruction}
            onChange={e => setFoodInstruction(e.target.value)}
            className="w-full bg-background border rounded-xl px-4 py-2.5"
          >
            <option>Before food</option>
            <option>After food</option>
            <option>With food</option>
            <option>Anytime</option>
            <option>No specific instruction</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">Start Date</label>
          <input 
            type="date"
            required
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full bg-background border rounded-xl px-4 py-2.5"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">End Date (Optional)</label>
          <div className="flex items-center gap-2">
             <input 
               type="date"
               value={endDate}
               onChange={e => setEndDate(e.target.value)}
               className="w-full bg-background border rounded-xl px-4 py-2.5"
             />
             {endDate && (
                <button type="button" onClick={() => setEndDate("")} className="text-sm font-semibold text-muted-foreground px-2">Clear</button>
             )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Leave empty if indefinite.</p>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-muted-foreground mb-1 block">Additional Instructions</label>
          <textarea 
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="e.g. Take with plenty of water"
            className="w-full bg-background border rounded-xl px-4 py-2.5 resize-none h-20"
          />
        </div>

        {!isDoctorView && (
          <div className="sm:col-span-2 flex items-center justify-between p-4 border rounded-xl bg-muted/30">
            <div>
              <p className="font-bold text-sm">Medicine Reminders</p>
              <p className="text-xs text-muted-foreground">Receive a notification when it's time.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={reminderEnabled} onChange={e => setReminderEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="rounded-xl">Cancel</Button>
        <Button type="submit" disabled={saving || !name || !dosage} className="rounded-xl">
          {saving ? "Saving..." : isDoctorView ? "Prescribe Medication" : "Add to Schedule"}
        </Button>
      </div>
    </form>
  )
}
