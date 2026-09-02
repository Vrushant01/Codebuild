import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { FileText, Save } from "lucide-react"

interface UpdateCaseModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  onSave: (data: any) => Promise<void>
}

export function UpdateCaseModal({ isOpen, onClose, appointmentId, onSave }: UpdateCaseModalProps) {
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ diagnosis, notes })
    setSaving(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Update Patient Case
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Diagnosis</label>
            <textarea 
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              placeholder="Enter manual diagnosis..."
              className="w-full bg-muted/50 border rounded-xl px-4 py-3 min-h-[100px] resize-none focus:bg-background transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Clinical Notes</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add observation notes..."
              className="w-full bg-muted/50 border rounded-xl px-4 py-3 min-h-[120px] resize-none focus:bg-background transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || (!diagnosis && !notes)} className="rounded-xl">
            {saving ? "Saving..." : "Save Updates"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
