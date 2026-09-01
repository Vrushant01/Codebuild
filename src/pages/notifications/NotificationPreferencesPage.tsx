import React, { useEffect, useState } from "react"
import { Bell, Calendar, Pill, Star, Video, Save, CheckCircle2 } from "lucide-react"
import { useNotifications } from "../../lib/notifications/NotificationContext"
import type { NotificationPreferences } from "../../lib/notifications/notification-types"
import { Switch } from "../../components/ui/switch"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../lib/auth/AuthContext"

export default function NotificationPreferencesPage() {
  const { user } = useAuth()
  const { getPreferences, updatePreferences } = useNotifications()
  
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getPreferences(user.id).then(setPreferences)
    }
  }, [user, getPreferences])

  const handleToggle = async (key: keyof NotificationPreferences, label: string) => {
    if (!preferences || !user) return

    const newValue = !preferences[key]
    
    // Optimistic update
    setPreferences(prev => prev ? { ...prev, [key]: newValue } : null)

    try {
      await updatePreferences(user.id, { [key]: newValue })
      
      // Show toast
      setToastMessage(`${label} preference updated.`)
      setTimeout(() => setToastMessage(null), 3000)
    } catch (e) {
      // Revert on error
      setPreferences(prev => prev ? { ...prev, [key]: !newValue } : null)
    }
  }

  if (!preferences) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-2xl" />
        <div className="h-24 bg-muted rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-foreground text-background px-4 py-2.5 rounded-full shadow-lg font-medium text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">Notification Preferences</h1>
        <p className="text-muted-foreground mt-1">Control how and when you receive updates.</p>
      </div>

      <div className="space-y-6">
        
        {/* Appointment Updates */}
        <div className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Appointment Updates</h3>
              <p className="text-sm text-muted-foreground">Get notified about confirmations, cancellations, and reminders.</p>
            </div>
          </div>
          <Switch 
            checked={preferences.appointmentUpdates} 
            onCheckedChange={() => handleToggle('appointmentUpdates', 'Appointment updates')}
          />
        </div>

        {/* Medicine Reminders */}
        <div className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Medicine Reminders</h3>
              <p className="text-sm text-muted-foreground">Get reminders for scheduled medicines.</p>
            </div>
          </div>
          <Switch 
            checked={preferences.medicineReminders} 
            onCheckedChange={() => handleToggle('medicineReminders', 'Medicine reminders')}
          />
        </div>

        {/* Telemedicine Reminders */}
        <div className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Telemedicine Reminders</h3>
              <p className="text-sm text-muted-foreground">Get alerted when your online consultation is starting soon.</p>
            </div>
          </div>
          <Switch 
            checked={preferences.telemedicineReminders} 
            onCheckedChange={() => handleToggle('telemedicineReminders', 'Telemedicine reminders')}
          />
        </div>

        {/* Feedback Updates */}
        <div className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Feedback Updates</h3>
              <p className="text-sm text-muted-foreground">Know when you can leave feedback and when it's verified.</p>
            </div>
          </div>
          <Switch 
            checked={preferences.feedbackUpdates} 
            onCheckedChange={() => handleToggle('feedbackUpdates', 'Feedback updates')}
          />
        </div>

      </div>

    </div>
  )
}

