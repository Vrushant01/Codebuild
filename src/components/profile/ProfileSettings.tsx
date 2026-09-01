import React from "react"
import { useAuth } from "../../lib/auth/AuthContext"
import type { ProfilePreferences } from "../../lib/profile/profile-types"
import { Bell, Lock, Shield, Globe, LogOut } from "lucide-react"
import { LanguageSwitcher } from "../layout/LanguageSwitcher"

interface ProfileSettingsProps {
  preferences: ProfilePreferences
  onUpdate: (updates: Partial<ProfilePreferences>) => void
}

export function ProfileSettings({ preferences, onUpdate }: ProfileSettingsProps) {
  const { logout } = useAuth()

  const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium">{label}</span>
      <button 
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      
      {/* Notifications */}
      <div className="bg-card border rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Notifications
        </h3>
        <div className="divide-y">
          <Toggle 
            label="Appointment reminders" 
            checked={preferences.appointmentReminders} 
            onChange={c => onUpdate({ appointmentReminders: c })} 
          />
          <Toggle 
            label="Medicine reminders" 
            checked={preferences.medicineReminders} 
            onChange={c => onUpdate({ medicineReminders: c })} 
          />
          <Toggle 
            label="Doctor follow-up alerts" 
            checked={preferences.doctorFollowUp} 
            onChange={c => onUpdate({ doctorFollowUp: c })} 
          />
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card border rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" /> Privacy
        </h3>
        
        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-4 flex gap-3">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Protected Medical Information</p>
            <p className="text-xs text-muted-foreground">
              This information is available only to authorized healthcare providers during relevant appointments.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Profile visibility</span>
          <span className="text-xs font-bold uppercase tracking-wider bg-muted px-2 py-1 rounded-md">Private</span>
        </div>
      </div>

      {/* Language */}
      <div className="bg-card border rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Language
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Select your preferred language for the Medireach interface.</p>
        
        <LanguageSwitcher variant="cards" />
      </div>

      {/* Danger Zone */}
      <div className="pt-6">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-4 text-destructive font-semibold rounded-2xl hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Log out of Medireach
        </button>
      </div>

    </div>
  )
}
