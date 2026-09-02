import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Users, Save, Trash2, ShieldCheck, AlertTriangle } from "lucide-react"
import type { Receptionist } from "../../lib/organization/organization-types"

interface ManageReceptionistModalProps {
  isOpen: boolean
  onClose: () => void
  receptionist: Receptionist | null
  onSave: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ManageReceptionistModal({ isOpen, onClose, receptionist, onSave, onDelete }: ManageReceptionistModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [shift, setShift] = useState("Morning")
  const [deskLocation, setDeskLocation] = useState("Front Desk")
  const [status, setStatus] = useState<"Active" | "Suspended">("Active")
  const [apptMgmt, setApptMgmt] = useState(true)
  const [patientBooking, setPatientBooking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (receptionist) {
      setName(receptionist.name || "")
      setEmail(receptionist.email || "")
      setMobile(receptionist.mobile || "")
      setShift((receptionist as any).shift || "Morning")
      setDeskLocation((receptionist as any).deskLocation || "Front Desk")
      setStatus(receptionist.status === "Suspended" ? "Suspended" : "Active")
      setApptMgmt(receptionist.permissions?.appointmentManagement ?? true)
      setPatientBooking(receptionist.permissions?.patientBooking ?? true)
    }
  }, [receptionist, isOpen])

  if (!receptionist) return null

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(receptionist.id, {
        name: name.trim(),
        email: email.trim(),
        phone: mobile.trim(),
        shift,
        deskLocation,
        status: status === "Active" ? "active" : "inactive",
        permissions: {
          appointmentManagement: apptMgmt,
          patientBooking: patientBooking,
          medicalDiagnosis: false,
          prescriptionManagement: false
        }
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove ${receptionist.name} from your organization?`)) {
      setDeleting(true)
      try {
        await onDelete(receptionist.id)
        onClose()
      } finally {
        setDeleting(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-[2rem] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="w-5 h-5 text-primary" /> Manage Staff Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Full Name</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jenil Mavani"
              className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
              <input 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="staff@hospital.com"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Mobile</label>
              <input 
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="+91..."
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Shift</label>
              <select 
                value={shift}
                onChange={e => setShift(e.target.value)}
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Morning">Morning (8 AM - 4 PM)</option>
                <option value="Evening">Evening (4 PM - 12 AM)</option>
                <option value="Night">Night (12 AM - 8 AM)</option>
                <option value="General">General (9 AM - 6 PM)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Account Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Permissions section */}
          <div className="bg-muted/30 border rounded-2xl p-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Role Permissions
            </h5>
            
            <label className="flex items-center justify-between p-2 rounded-xl bg-card border cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-sm font-semibold">Appointment Management</span>
              <input 
                type="checkbox"
                checked={apptMgmt}
                onChange={e => setApptMgmt(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-card border cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-sm font-semibold">Patient Booking & Token Generation</span>
              <input 
                type="checkbox"
                checked={patientBooking}
                onChange={e => setPatientBooking(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold uppercase text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
                </h5>
                <p className="text-xs text-muted-foreground mt-0.5">Remove receptionist access from organization.</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete} 
                disabled={deleting}
                className="rounded-xl font-bold"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> {deleting ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="rounded-xl font-bold">
            {saving ? "Saving..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
