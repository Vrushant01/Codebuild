import React, { useState } from "react"
import { Button } from "../ui/button"
import { FileText, Save, CheckCircle2 } from "lucide-react"

export function DoctorNotesPanel() {
  const [notes, setNotes] = useState({
    symptoms: "",
    diagnosis: "",
    treatment: "",
    additionalNotes: ""
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaving(true)
    // Mock save delay
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }

  return (
    <div className="flex flex-col h-full bg-card border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Consultation Notes
        </h3>
        {saved && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
            <CheckCircle2 className="w-3 h-3" /> Saved
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Current Symptoms</label>
          <textarea 
            className="w-full min-h-[80px] p-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="E.g. Mild fever, dry cough for 3 days..."
            value={notes.symptoms}
            onChange={(e) => setNotes({ ...notes, symptoms: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Diagnosis</label>
          <textarea 
            className="w-full min-h-[80px] p-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="E.g. Viral URI"
            value={notes.diagnosis}
            onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Treatment Plan</label>
          <textarea 
            className="w-full min-h-[80px] p-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="E.g. Rest, hydration, paracetamol SOS"
            value={notes.treatment}
            onChange={(e) => setNotes({ ...notes, treatment: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Additional Notes</label>
          <textarea 
            className="w-full min-h-[80px] p-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Private notes..."
            value={notes.additionalNotes}
            onChange={(e) => setNotes({ ...notes, additionalNotes: e.target.value })}
          />
        </div>
      </div>

      <div className="p-4 border-t bg-background shrink-0">
        <Button 
          className="w-full shadow-sm" 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Notes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
