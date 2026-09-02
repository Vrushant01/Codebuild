import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Pill } from "lucide-react"
import { AddMedicineForm, type MedicineFormData } from "./AddMedicineForm"
import { scheduleService } from "../../lib/schedule/schedule-service"

interface AddMedicineModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => Promise<void>
}

// Patient's version
export function AddMedicineModal({ isOpen, onClose, onSuccess }: AddMedicineModalProps) {
  const [saving, setSaving] = useState(false)

  const handleSave = async (data: MedicineFormData) => {
    setSaving(true)
    try {
      await scheduleService.addMedicine({
         name: data.name,
         dosage: data.dosage,
         frequency: data.frequency,
         times: data.times,
         foodInstruction: data.foodInstruction,
         startDate: data.startDate,
         endDate: data.endDate || undefined,
         instructions: data.instructions,
         source: "PATIENT",
         reminderEnabled: data.reminderEnabled
      })
      if (onSuccess) {
        await onSuccess()
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
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Pill className="w-5 h-5 text-primary" /> Add Medicine
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
           <AddMedicineForm 
             isDoctorView={false}
             saving={saving}
             onSave={handleSave}
             onCancel={onClose}
           />
        </div>
      </DialogContent>
    </Dialog>
  )
}
