import React, { useState, useEffect } from "react"
import { 
  Globe, 
  Bell, 
  Eye, 
  ShieldCheck, 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Mail, 
  Phone, 
  Sparkles,
  IndianRupee,
  ShieldAlert,
  KeyRound
} from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"
import { Button } from "../../../components/ui/button"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Platform settings state
  const [settings, setSettings] = useState({
    platformName: "MEDIREACH",
    supportEmail: "support@medireach.com",
    supportPhone: "+91 98765 43210",
    defaultLanguage: "English",
    availableLanguages: ["English", "Gujarati", "Hindi"],
    platformCommissionPerPatient: 10,
    currency: "INR",
    requireOrgApproval: true,
    autoPublishListings: true,
    notifications: {
      orgSubmitted: true,
      orgApproved: true,
      orgRejected: true,
      orgSuspended: true,
      paymentReceived: true,
      emailAlerts: true
    },
    security: {
      allowNewRegistrations: true,
      maintenanceMode: false,
      sessionTimeoutMinutes: 60
    }
  })

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await adminService.getPlatformSettings()
      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data,
          notifications: {
            ...prev.notifications,
            ...(data.notifications || {})
          },
          security: {
            ...prev.security,
            ...(data.security || {})
          }
        }))
      }
    } catch (err: any) {
      console.warn("Failed to load settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      await adminService.updatePlatformSettings(settings)
      setSuccessMessage("Platform settings saved and applied successfully.")
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update platform settings.")
      setTimeout(() => setErrorMessage(null), 4000)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." })
      return
    }

    setPasswordLoading(true)
    try {
      await adminService.changeAdminPassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordMessage({ type: "success", text: "Admin password changed successfully." })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordMessage(null)
      }, 2000)
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to change password. Check your current password." })
    } finally {
      setPasswordLoading(false)
    }
  }

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const toggleSecurity = (key: keyof typeof settings.security) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: !prev.security[key]
      }
    }))
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-2xl w-1/3" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-muted rounded-3xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 rounded-[2rem] border border-primary/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary px-3 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> System Configuration
            </span>
            <span className="text-xs text-muted-foreground font-medium">• Live MongoDB Persistence</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Configure global monetization, language rules, automated listings, and platform access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={loadSettings}
            variant="outline" 
            className="rounded-2xl font-bold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </Button>
          <Button 
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-2xl animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 1. Platform & Monetization Settings */}
        <div className="bg-card border rounded-[2rem] p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg">Platform & General</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Platform Name
              </label>
              <input 
                type="text"
                value={settings.platformName}
                onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full bg-muted/40 border border-border focus:border-primary px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Default Language
                </label>
                <select 
                  value={settings.defaultLanguage}
                  onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary px-3 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-colors"
                >
                  <option value="English">English</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-primary" /> Fee Rate / Patient
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">₹</span>
                  <input 
                    type="number"
                    min={1}
                    value={settings.platformCommissionPerPatient}
                    onChange={e => setSettings({ ...settings, platformCommissionPerPatient: Number(e.target.value) || 10 })}
                    className="w-full bg-muted/40 border border-border focus:border-primary pl-8 pr-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Support Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input 
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Support Hotline Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input 
                  type="text"
                  value={settings.supportPhone}
                  onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Available Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {["English", "Gujarati", "Hindi"].map(lang => (
                  <span key={lang} className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-xl border border-primary/20">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Listings & Directory Workflow */}
        <div className="bg-card border rounded-[2rem] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg">Listings & Verification</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 p-3.5 bg-muted/30 rounded-2xl border">
                <div>
                  <div className="font-bold text-sm text-foreground">Organization Approval Required</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Newly registered hospitals/clinics must be reviewed before public activation.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, requireOrgApproval: !settings.requireOrgApproval })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${
                    settings.requireOrgApproval ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.requireOrgApproval ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-3.5 bg-muted/30 rounded-2xl border">
                <div>
                  <div className="font-bold text-sm text-foreground">Auto-publish listings</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Approved doctor profiles and clinic directories become visible immediately upon activation.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, autoPublishListings: !settings.autoPublishListings })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${
                    settings.autoPublishListings ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.autoPublishListings ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-3.5 bg-muted/30 rounded-2xl border">
                <div>
                  <div className="font-bold text-sm text-foreground">Allow New Public Registrations</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Enable prospective medical organizations and doctors to create onboarding accounts.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSecurity("allowNewRegistrations")}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${
                    settings.security.allowNewRegistrations ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.security.allowNewRegistrations ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl text-xs text-muted-foreground">
            💡 Changes to verification flow will take effect immediately for all pending organization listing queues.
          </div>
        </div>

        {/* 3. Admin Notification Triggers */}
        <div className="bg-card border rounded-[2rem] p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg">Real-Time Notification Triggers</h2>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: "orgSubmitted", label: "Organization submitted", desc: "Notify admin when a hospital submits registration." },
              { key: "orgApproved", label: "Organization approved", desc: "Send confirmation alert upon facility approval." },
              { key: "orgRejected", label: "Organization rejected", desc: "Notify admin when onboarding is flagged/rejected." },
              { key: "orgSuspended", label: "Organization suspended", desc: "Notify upon policy violations or status suspension." },
              { key: "paymentReceived", label: "Razorpay commission settled", desc: "Real-time alert when an organization pays ₹10/pt fees." },
              { key: "emailAlerts", label: "System Email Alerts", desc: "Dispatch critical audit alerts to support email." }
            ].map(({ key, label, desc }) => {
              const isEnabled = (settings.notifications as any)[key]
              return (
                <div key={key} className="flex items-center justify-between gap-4 p-3 bg-muted/20 hover:bg-muted/40 transition-colors rounded-2xl border border-border/60">
                  <div>
                    <div className="font-bold text-sm text-foreground">{label}</div>
                    <div className="text-[11px] text-muted-foreground">{desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification(key as any)}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${
                      isEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      isEnabled ? "right-1" : "left-1"
                    }`} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Access & Security */}
        <div className="bg-card border rounded-[2rem] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg">Access & Security</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-2xl border space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Access Level
                </label>
                <div className="text-xl font-heading font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Super Admin Control Center
                </div>
                <p className="text-xs text-muted-foreground">
                  Full administrative permissions across all healthcare organizations, doctors, and settlements.
                </p>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between gap-4 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div>
                  <div className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Platform Maintenance Mode
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Display maintenance banner to non-admin visitors.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSecurity("maintenanceMode")}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${
                    settings.security.maintenanceMode ? "bg-amber-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.security.maintenanceMode ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>

              {/* Change Password Card */}
              <div className="pt-2">
                <Button 
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="w-full rounded-2xl font-bold py-5 flex items-center justify-center gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-primary" /> Update Admin Password
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t text-xs text-muted-foreground flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Encrypted with SHA-256 and JWT Token Session validation.</span>
          </div>
        </div>

      </div>

      {/* Save Floating Bar */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => handleSave()}
          disabled={saving}
          className="bg-primary text-primary-foreground font-bold px-8 py-6 rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform text-base flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving Changes..." : "Save Platform Settings"}
        </Button>
      </div>

      {/* Update Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Change Admin Password</h3>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground font-bold text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {passwordMessage && (
              <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                passwordMessage.type === "success" 
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                  : "bg-destructive/10 border border-destructive/30 text-destructive"
              }`}>
                {passwordMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Current Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  New Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Enter new password (min. 6 chars)"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Confirm New Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="bg-primary text-primary-foreground rounded-xl font-bold"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
