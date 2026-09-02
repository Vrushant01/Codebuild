import React, { useState, useEffect } from "react"
import { organizationService } from "../../lib/organization/organization-service"
import type { NotificationSettings } from "../../lib/organization/organization-types"
import { Bell, Lock, ShieldAlert, Save } from "lucide-react"
import { Button } from "../../components/ui/button"

export default function OrgSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      const data = await organizationService.getSettings()
      setSettings(data)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setSavedSuccess(false)
    try {
      await organizationService.updateSettings(settings)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return <div className="p-8 animate-pulse text-center">Loading settings...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      
      <div>
        <h1 className="text-3xl font-heading font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">Manage notifications, privacy, and system preferences.</p>
      </div>

      {/* Notifications */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Notifications
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-background border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
            <div>
              <p className="font-bold">New Booking Alerts</p>
              <p className="text-sm text-muted-foreground">Receive alerts when patients book new appointments.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.newBookingAlerts}
              onChange={e => setSettings({...settings, newBookingAlerts: e.target.checked})}
              className="w-5 h-5 accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-background border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
            <div>
              <p className="font-bold">Cancellation Alerts</p>
              <p className="text-sm text-muted-foreground">Notify staff when an appointment is cancelled.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.cancellationAlerts}
              onChange={e => setSettings({...settings, cancellationAlerts: e.target.checked})}
              className="w-5 h-5 accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-background border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
            <div>
              <p className="font-bold">Staff Activity Summary</p>
              <p className="text-sm text-muted-foreground">Receive daily summaries of staff and doctor activity.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.staffActivity}
              onChange={e => setSettings({...settings, staffActivity: e.target.checked})}
              className="w-5 h-5 accent-primary"
            />
          </label>
        </div>
      </div>

      {/* Privacy and Compliance */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-500" /> Privacy & Security Boundaries
        </h2>
        
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-5 mb-6">
          <div className="flex gap-3 text-emerald-700 dark:text-emerald-400">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Patient Medical Information is Protected</p>
              <p>Your organization's dashboard enforces strict data boundaries. Receptionists and administrative staff cannot access patient diagnoses, clinical notes, allergies, or prescriptions. Clinical data is strictly isolated to the patient-doctor relationship.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 border rounded-2xl border-dashed">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">Role-Based Access Control</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-sm text-muted-foreground">Staff permissions are automatically enforced based on assigned roles (Admin, Doctor, Receptionist).</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {savedSuccess ? (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold animate-in fade-in">
            ✓ Settings saved successfully!
          </div>
        ) : <div />}
        <Button onClick={handleSave} disabled={saving} className="px-8 py-6 rounded-2xl text-lg font-bold shadow-md w-full sm:w-auto">
          {saving ? "Saving..." : "Save Settings"} <Save className="w-5 h-5 ml-2" />
        </Button>
      </div>

    </div>
  )
}
