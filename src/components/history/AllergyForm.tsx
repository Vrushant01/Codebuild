import React, { useState } from "react"
import { ShieldAlert, Info, X } from "lucide-react"
import { Button } from "../ui/button"
import type { Allergy, AllergySeverity, PreviousOccurrence } from "../../lib/history/medical-history-types"

interface AllergyFormProps {
  initialData?: Partial<Allergy>
  onSave: (data: Partial<Allergy>) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
}

const COMMON_ALLERGENS = ["Penicillin", "Peanuts", "Dust", "Pollen", "Latex", "Aspirin", "Ibuprofen", "Sulfa drugs", "Other"]

export function AllergyForm({ initialData, onSave, onCancel, onDelete }: AllergyFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [customName, setCustomName] = useState("")
  const [reaction, setReaction] = useState(initialData?.reaction || "")
  const [symptoms, setSymptoms] = useState(initialData?.symptoms || "")
  const [severity, setSeverity] = useState<AllergySeverity | "">(initialData?.severity || "")
  const [previousOccurrence, setPreviousOccurrence] = useState<PreviousOccurrence | "">(initialData?.previousOccurrence || "")
  const [notes, setNotes] = useState(initialData?.notes || "")
  
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const finalName = name === "Other" ? customName : name
    if (!finalName.trim()) {
      setError("Please specify the allergy name.")
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: finalName,
        category: "Other", // For simplicity, unless we add a category selector
        reaction,
        symptoms,
        severity: (severity as AllergySeverity) || undefined,
        previousOccurrence: (previousOccurrence as PreviousOccurrence) || undefined,
        notes
      })
    } catch (err) {
      setError("Allergy couldn't be saved. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (window.confirm("Remove this allergy from your active allergy list?")) {
      setDeleting(true)
      try {
        await onDelete()
      } catch (err) {
        setError("Allergy couldn't be deleted. Please try again.")
        setDeleting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm flex justify-between items-start">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-muted-foreground mb-1.5 block">Allergy Name <span className="text-red-500">*</span></label>
        <select 
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-background border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="" disabled>Select an allergy...</option>
          {COMMON_ALLERGENS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {name === "Other" && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="text-sm font-bold text-muted-foreground mb-1.5 block">Specify Allergy <span className="text-red-500">*</span></label>
          <input 
            required
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="e.g. Seafood, Bee stings"
            className="w-full bg-background border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-muted-foreground mb-1.5 block">What happened? (Reaction)</label>
        <textarea 
          value={reaction}
          onChange={e => setReaction(e.target.value)}
          placeholder="e.g. Developed a skin rash within 2 hours"
          className="w-full bg-background border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none h-20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-muted-foreground mb-1.5 block">Severity (Optional)</label>
          <select 
            value={severity}
            onChange={e => setSeverity(e.target.value as AllergySeverity)}
            className="w-full bg-background border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="">Select severity...</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-bold text-muted-foreground mb-1.5 block">Previous Occurrence</label>
          <select 
            value={previousOccurrence}
            onChange={e => setPreviousOccurrence(e.target.value as PreviousOccurrence)}
            className="w-full bg-background border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="">Select occurrence...</option>
            <option value="First time">First time</option>
            <option value="Happened before">Happened before</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>
      </div>

      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <p>This information is shared with your doctors to ensure safe prescribing during consultations.</p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t">
        {onDelete && (
          <Button type="button" variant="ghost" onClick={handleDelete} disabled={deleting || saving} className="text-destructive hover:bg-destructive/10 sm:mr-auto">
            {deleting ? "Removing..." : "Remove Allergy"}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving || deleting} className="rounded-xl">Cancel</Button>
        <Button type="submit" disabled={saving || deleting || !name} className="rounded-xl shadow-md">
          {saving ? "Saving..." : "Save allergy"}
        </Button>
      </div>

    </form>
  )
}
