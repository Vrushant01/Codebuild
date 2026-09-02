import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Pill } from "lucide-react"
import { AddMedicineForm, type MedicineFormData } from "../schedule/AddMedicineForm"
import { scheduleService } from "../../lib/schedule/schedule-service"

interface AddMedicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: any) => Promise<void>
}

// Doctor's version
export function AddMedicationModal({ isOpen, onClose, onSave }: AddMedicationModalProps) {
  const [saving, setSaving] = useState(false)

  const handleSave = async (data: MedicineFormData) => {
    setSaving(true)
    try {
      if (onSave) {
        await onSave({ ...data, source: "DOCTOR" })
      } else {
        await scheduleService.addMedicine({
           name: data.name,
           dosage: data.dosage,
           frequency: data.frequency,
           times: data.times,
           foodInstruction: data.foodInstruction,
           startDate: data.startDate,
           endDate: data.endDate || undefined,
           instructions: data.instructions,
           source: "DOCTOR",
           reminderEnabled: data.reminderEnabled
        })
      }
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-[2rem] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-500" /> Prescribe Medication
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
           <AddMedicineForm 
             isDoctorView={true}
             saving={saving}
             onSave={handleSave}
             onCancel={onClose}
           />
        </div>
      </DialogContent>
    </Dialog>
  )
}
