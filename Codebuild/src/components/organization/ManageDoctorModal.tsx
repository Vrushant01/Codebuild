import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Stethoscope, Save, Trash2, ShieldCheck, AlertTriangle } from "lucide-react"
import type { OrganizationDoctor } from "../../lib/organization/organization-types"

interface ManageDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  doctor: OrganizationDoctor | null
  onSave: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ManageDoctorModal({ isOpen, onClose, doctor, onSave, onDelete }: ManageDoctorModalProps) {
  const [name, setName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [experienceYears, setExperienceYears] = useState("5")
  const [consultationFee, setConsultationFee] = useState("500")
  const [telemedicineFee, setTelemedicineFee] = useState("400")
  const [status, setStatus] = useState<"Active" | "Inactive">("Active")
  const [availability, setAvailability] = useState("available")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (doctor) {
      setName(doctor.name || "")
      setSpecialization(doctor.specialization || "General Physician")
      setExperienceYears(String(doctor.experience || (doctor as any).experienceYears || 5))
      setConsultationFee(String((doctor as any).consultationFee || 500))
      setTelemedicineFee(String((doctor as any).telemedicineFee || 400))
      setStatus((doctor.status as string) === "Inactive" || (doctor.status as string) === "Suspended" ? "Inactive" : "Active")
      setAvailability(doctor.availability?.status || "available")
    }
  }, [doctor, isOpen])

  if (!doctor) return null

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(doctor.id, {
        name: name.trim(),
        specialization: specialization.trim(),
        experienceYears: Number(experienceYears) || 5,
        consultationFee: Number(consultationFee) || 500,
        telemedicineFee: Number(telemedicineFee) || 400,
        active: status === "Active",
        availability: {
          ...doctor.availability,
          status: availability
        }
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove ${doctor.name} from your organization?`)) {
      setDeleting(true)
      try {
        await onDelete(doctor.id)
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
            <Stethoscope className="w-5 h-5 text-primary" /> Manage Doctor Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Doctor Name</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Aarav Patel"
              className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Specialization</label>
              <input 
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                placeholder="e.g. Cardiology"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Experience (Years)</label>
              <input 
                type="number"
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                placeholder="5"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Consultation Fee (₹)</label>
              <input 
                type="number"
                value={consultationFee}
                onChange={e => setConsultationFee(e.target.value)}
                placeholder="500"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Telemedicine Fee (₹)</label>
              <input 
                type="number"
                value={telemedicineFee}
                onChange={e => setTelemedicineFee(e.target.value)}
                placeholder="400"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Account Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Current Availability</label>
              <select 
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="available">Available</option>
                <option value="busy">Busy / In Consultation</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold uppercase text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
                </h5>
                <p className="text-xs text-muted-foreground mt-0.5">Remove doctor association from this organization.</p>
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
