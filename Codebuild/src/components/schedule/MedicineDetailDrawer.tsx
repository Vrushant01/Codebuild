import React, { useState, useEffect } from "react"
import { Pill, X, Clock, Calendar, Utensils, Info, AlertTriangle, ShieldCheck, Trash2, Check, User, RotateCcw, Edit2, ChevronLeft } from "lucide-react"
import { Button } from "../ui/button"
import type { Medicine } from "../../lib/schedule/schedule-types"
import { scheduleService } from "../../lib/schedule/schedule-service"
import { AddMedicineForm, type MedicineFormData } from "./AddMedicineForm"
import { cn } from "../../lib/utils"

interface MedicineDetailDrawerProps {
  medicine: Medicine | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function MedicineDetailDrawer({ medicine, isOpen, onClose, onUpdate }: MedicineDetailDrawerProps) {
  const [currentMed, setCurrentMed] = useState<Medicine | null>(medicine)
  const [isEditing, setIsEditing] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(medicine?.reminderEnabled ?? true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingReminder, setIsSavingReminder] = useState(false)

  useEffect(() => {
    setCurrentMed(medicine)
    setIsEditing(false)
    if (medicine) {
      setReminderEnabled(medicine.reminderEnabled)
    }
  }, [medicine, isOpen])

  if (!isOpen || !currentMed) return null

  const isPrescribed = currentMed.source === "DOCTOR"
  const isHistoryItem = currentMed.status === "cancelled" || currentMed.status === "completed"

  const handleToggleReminder = async () => {
    setIsSavingReminder(true)
    const newVal = !reminderEnabled
    setReminderEnabled(newVal)
    await scheduleService.toggleReminder(currentMed.id, newVal)
    setIsSavingReminder(false)
    onUpdate()
  }

  const handleRemoveFromSchedule = async () => {
    if (window.confirm("Are you sure you want to remove this medicine from your active schedule? It will be moved to History.")) {
      setIsDeleting(true)
      await scheduleService.deleteMedicine(currentMed.id)
      setIsDeleting(false)
      onUpdate()
      onClose()
    }
  }

  const handleRestoreToSchedule = async () => {
    setIsRestoring(true)
    await scheduleService.restoreMedicine(currentMed.id)
    setIsRestoring(false)
    onUpdate()
    onClose()
  }

  const handlePermanentDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this medicine from your records?")) {
      setIsDeleting(true)
      await scheduleService.permanentDeleteMedicine(currentMed.id)
      setIsDeleting(false)
      onUpdate()
      onClose()
    }
  }

  const handleSaveEdit = async (formData: MedicineFormData) => {
    setIsSaving(true)
    try {
      const updated = await scheduleService.updateMedicine(currentMed.id, {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times,
        foodInstruction: formData.foodInstruction as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        instructions: formData.instructions,
        reminderEnabled: formData.reminderEnabled
      })
      if (updated) {
        setCurrentMed(updated)
      }
      setIsEditing(false)
      onUpdate()
    } catch (err) {
      console.error("Failed to update medicine:", err)
    } finally {
      setIsSaving(false)
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
        "lg:inset-y-0 lg:right-0 lg:w-[480px] lg:border-l",
        // Mobile: Bottom sheet
        "inset-x-0 bottom-0 rounded-t-[2rem] lg:rounded-none max-h-[92vh] lg:max-h-none"
      )}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b shrink-0 bg-card">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground mr-1"
                title="Back to details"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isPrescribed ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-primary/10 text-primary"
              )}>
                <Pill className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-heading">
                  {isEditing ? "Edit Medicine" : currentMed.name}
                </h2>
                {!isEditing && (
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                    currentMed.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                    currentMed.status === "cancelled" ? "bg-muted text-muted-foreground" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {currentMed.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {isEditing ? "Update schedule, dosage & instructions" : currentMed.dosage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditing && !isPrescribed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-primary hover:bg-primary/10 rounded-xl gap-1.5 font-semibold"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
          
          {isEditing ? (
            /* EDIT FORM VIEW */
            <div className="animate-in fade-in duration-200">
              <AddMedicineForm
                initialData={{
                  name: currentMed.name,
                  dosage: currentMed.dosage,
                  frequency: currentMed.frequency,
                  times: currentMed.times,
                  foodInstruction: currentMed.foodInstruction,
                  startDate: currentMed.startDate,
                  endDate: currentMed.endDate || "",
                  instructions: currentMed.instructions || "",
                  reminderEnabled: currentMed.reminderEnabled
                }}
                saving={isSaving}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            /* DETAILS VIEW */
            <>
              {/* Source Badge */}
              {isPrescribed ? (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 flex items-start gap-3 text-blue-700 dark:text-blue-400">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Prescribed by {currentMed.prescribedBy || "Doctor"}</p>
                    <p className="text-xs font-medium mt-1">This medication schedule was created by your healthcare provider. Please follow their instructions carefully.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 border rounded-2xl p-4 flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 shrink-0" />
                    <p className="font-semibold text-sm tracking-tight">Added by you</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-xs h-8 rounded-lg gap-1 font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Change
                  </Button>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Frequency</span>
                  </div>
                  <p className="font-bold">{currentMed.frequency}</p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{currentMed.times?.join(", ")}</p>
                </div>

                <div className="bg-card border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Utensils className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Food</span>
                  </div>
                  <p className="font-bold">{currentMed.foodInstruction}</p>
                </div>

                <div className="bg-card border rounded-2xl p-4 shadow-sm col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="font-bold">
                    {currentMed.startDate} 
                    <span className="text-muted-foreground font-medium"> to </span> 
                    {currentMed.endDate || "Until updated"}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              {currentMed.instructions && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Instructions</span>
                  </div>
                  <p className="text-amber-900 dark:text-amber-200 text-sm font-medium">
                    {currentMed.instructions}
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
            </>
          )}

        </div>

        {/* Footer Actions */}
        {!isEditing && (
          <div className="p-5 lg:p-6 border-t shrink-0 flex flex-col gap-3 bg-background">
            {!isPrescribed ? (
              isHistoryItem ? (
                // Actions when viewing a medicine from History
                <div className="space-y-3">
                  <Button 
                    onClick={handleRestoreToSchedule}
                    disabled={isRestoring || isDeleting}
                    className="w-full rounded-xl py-6 font-semibold gap-2 shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isRestoring ? "Adding back..." : "Add back to Schedule"}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handlePermanentDelete}
                    disabled={isDeleting || isRestoring}
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 rounded-xl py-5"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete from History"}
                  </Button>
                </div>
              ) : (
                // Actions when viewing an active medicine
                <Button 
                  variant="outline" 
                  onClick={handleRemoveFromSchedule}
                  disabled={isDeleting}
                  className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 rounded-xl py-6 font-medium"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  {isDeleting ? "Removing..." : "Remove from Schedule"}
                </Button>
              )
            ) : (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onClose()
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
        )}
      </div>
    </>
  )
}
