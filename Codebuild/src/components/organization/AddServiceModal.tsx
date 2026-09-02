import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Activity, Save, Edit3 } from "lucide-react"
import type { HealthcareService } from "../../lib/organization/organization-types"

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  initialService?: HealthcareService | null
}

export function AddServiceModal({ isOpen, onClose, onSave, initialService }: AddServiceModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("500")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialService) {
      setName(initialService.name || "")
      setDescription(initialService.description || "")
      setPrice((initialService as any).price ? String((initialService as any).price) : "500")
    } else {
      setName("")
      setDescription("")
      setPrice("500")
    }
  }, [initialService, isOpen])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        price: Number(price) || 500,
        status: initialService?.status || "Active",
        doctorIds: initialService?.doctorIds || []
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const isEditing = !!initialService

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit3 className="w-5 h-5 text-primary" /> : <Activity className="w-5 h-5 text-primary" />}
            {isEditing ? "Edit Service" : "Add New Service"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Service Name</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. General Health Checkup"
              className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Standard Fee (₹)</label>
            <input 
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="500"
              className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a short clinical description of this service..."
              className="w-full bg-muted/50 border rounded-xl px-4 py-3 min-h-[90px] resize-none focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="rounded-xl">
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Service"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
