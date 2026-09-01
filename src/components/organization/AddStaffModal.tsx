import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { UserPlus, Save } from "lucide-react"

interface AddStaffModalProps {
  isOpen: boolean
  onClose: () => void
  role: "Doctor" | "Receptionist"
  onSave: (data: any) => Promise<void>
}

export function AddStaffModal({ isOpen, onClose, role, onSave }: AddStaffModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const data = role === "Doctor" 
      ? { name, email, mobile, specialization, role }
      : { name, email, mobile, role }
    await onSave(data)
    setSaving(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Add {role}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Full Name</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Aarav Patel"
              className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:bg-background transition-colors"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">Email</label>
              <input 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:bg-background transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">Mobile</label>
              <input 
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="+91..."
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:bg-background transition-colors"
              />
            </div>
          </div>

          {role === "Doctor" && (
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">Specialization</label>
              <input 
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                placeholder="e.g. Cardiologist"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:bg-background transition-colors"
              />
            </div>
          )}

          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 mt-2">
            <p className="text-xs text-primary font-medium">
              An invitation email will be sent to the {role.toLowerCase()} with instructions to join the organization.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name || !email} className="rounded-xl">
            {saving ? "Sending Invite..." : "Send Invitation"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
