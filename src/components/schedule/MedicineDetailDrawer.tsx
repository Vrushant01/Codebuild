import React, { useState, useEffect } from "react"
import { Pill, X, Clock, Calendar, Utensils, Info, AlertTriangle, ShieldCheck, Trash2, Check, User } from "lucide-react"
import { Button } from "../ui/button"
import type { Medicine } from "../../lib/schedule/schedule-types"
import { scheduleService } from "../../lib/schedule/schedule-service"
import { cn } from "../../lib/utils"

interface MedicineDetailDrawerProps {
  medicine: Medicine | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function MedicineDetailDrawer({ medicine, isOpen, onClose, onUpdate }: MedicineDetailDrawerProps) {
  const [reminderEnabled, setReminderEnabled] = useState(medicine?.reminderEnabled ?? true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingReminder, setIsSavingReminder] = useState(false)

  useEffect(() => {
    if (medicine) {
      setReminderEnabled(medicine.reminderEnabled)
    }
  }, [medicine])

  if (!isOpen || !medicine) return null

  const isPrescribed = medicine.source === "DOCTOR"

  const handleToggleReminder = async () => {
    setIsSavingReminder(true)
    const newVal = !reminderEnabled
    setReminderEnabled(newVal)
    await scheduleService.toggleReminder(medicine.id, newVal)
    setIsSavingReminder(false)
    onUpdate()
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to remove this medicine from your schedule?")) {
      setIsDeleting(true)
      await scheduleService.deleteMedicine(medicine.id)
      setIsDeleting(false)
      onUpdate()
      onClose()
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed z-50 bg-background shadow-2xl transition-transform duration-300 ease-out flex flex-col",
        // Desktop: Right side drawer
        "lg:inset-y-0 lg:right-0 lg:w-[450px] lg:border-l",
        // Mobile: Bottom sheet
        "inset-x-0 bottom-0 rounded-t-[2rem] lg:rounded-none max-h-[90vh] lg:max-h-none"
      )}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isPrescribed ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-primary/10 text-primary"
            )}>
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">{medicine.name}</h2>
              <p className="text-sm text-muted-foreground font-medium">{medicine.dosage}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
          
          {/* Source Badge */}
          {isPrescribed ? (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 flex items-start gap-3 text-blue-700 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Prescribed by {medicine.prescribedBy || "Doctor"}</p>
                <p className="text-xs font-medium mt-1">This medication schedule was created by your healthcare provider. Please follow their instructions carefully.</p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 border rounded-2xl p-4 flex items-center gap-3 text-muted-foreground">
              <User className="w-5 h-5 shrink-0" />
              <p className="font-semibold text-sm tracking-tight">Added by you</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Frequency</span>
              </div>
              <p className="font-bold">{medicine.frequency}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{medicine.times.join(", ")}</p>
            </div>

            <div className="bg-card border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Utensils className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Food</span>
              </div>
              <p className="font-bold">{medicine.foodInstruction}</p>
            </div>

            <div className="bg-card border rounded-2xl p-4 shadow-sm col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
              </div>
              <p className="font-bold">
                {medicine.startDate} 
                <span className="text-muted-foreground font-medium"> to </span> 
                {medicine.endDate || "Until updated"}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {medicine.instructions && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 mb-2">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Instructions</span>
              </div>
              <p className="text-amber-900 dark:text-amber-200 text-sm font-medium">
                {medicine.instructions}
              </p>
            </div>
          )}

          <hr className="border-border/60" />

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold flex items-center gap-2">Medicine Reminder</p>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">We'll remind you when it's time.</p>
            </div>
            <label className={cn(
              "relative inline-flex items-center cursor-pointer",
              isSavingReminder && "opacity-50 pointer-events-none"
            )}>
              <input type="checkbox" checked={reminderEnabled} onChange={handleToggleReminder} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 lg:p-6 border-t shrink-0 flex flex-col gap-3 bg-background">
          {!isPrescribed ? (
            <Button 
              variant="outline" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 rounded-xl py-6"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              {isDeleting ? "Removing..." : "Remove from Schedule"}
            </Button>
          ) : (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  onClose()
                  // trigger prompt 23 or doctor contact somehow
                  alert("Opening Contact Doctor flow...")
                }}
                className="w-full rounded-xl py-6 border-primary/20 text-primary hover:bg-primary/5"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Contact Doctor for Changes
              </Button>
              <p className="text-xs text-muted-foreground mt-3 font-medium px-4">
                You cannot edit or delete prescribed medications directly. Please contact your doctor.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
