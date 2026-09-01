import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Activity, Save } from "lucide-react"

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export function AddServiceModal({ isOpen, onClose, onSave }: AddServiceModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ name, description, status: "Active", doctorIds: [] })
    setSaving(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Add New Service
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Service Name</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. General Checkup"
              className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:bg-background transition-colors"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a short description of this service..."
              className="w-full bg-muted/50 border rounded-xl px-4 py-3 min-h-[100px] resize-none focus:bg-background transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name} className="rounded-xl">
            {saving ? "Saving..." : "Add Service"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
