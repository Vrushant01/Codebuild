import React, { useState, useEffect } from "react"
import { Building, ShieldCheck, Mail, Phone, Award, Save, CheckCircle, AlertCircle, Edit3, Lock } from "lucide-react"
import { apiClient } from "../../lib/api/apiClient"
import { Button } from "../../components/ui/button"

interface DoctorProfileData {
  id: string
  name: string
  specialization: string
  experienceYears: number
  organizationName: string
  email: string
  phone: string
  rating: number
  reviewCount: number
  bio?: string
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfileData>({
    id: "",
    name: "Dr. Aarav Patel",
    specialization: "General Physician",
    experienceYears: 10,
    organizationName: "CityCare Clinic, Surat",
    email: "dr.patel@citycare.example",
    phone: "+91 1234567890",
    rating: 4.8,
    reviewCount: 12
  })

  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get<{ success: boolean; data: DoctorProfileData }>("/doctors/me/profile")
        if (res && res.data) {
          setProfile(res.data)
          setEmail(res.data.email || "")
          setPhone(res.data.phone || "")
        }
      } catch (err) {
        console.warn("Could not fetch doctor profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await apiClient.put<{ success: boolean; message: string; data: any }>("/doctors/me/profile", {
        email: email.trim(),
        phone: phone.trim()
      })

      if (res && res.success) {
        setProfile(prev => ({
          ...prev,
          email: email.trim(),
          phone: phone.trim()
        }))
        showToast("Email ID and Phone number updated successfully!")
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update contact info", false)
    } finally {
      setSaving(false)
    }
  }

  const avatarInitials = (profile.name || "Dr")
    .replace("Dr. ", "")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const hasChanges = email.trim() !== (profile.email || "").trim() || phone.trim() !== (profile.phone || "").trim()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
          toast.ok 
            ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30" 
            : "bg-destructive/90 text-destructive-foreground border-destructive"
        }`}>
          {toast.ok ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Provider Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your public information and credentials.</p>
      </div>

      {/* Main Identity (Read-Only Medical Credentials) */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl shrink-0 shadow-inner border border-primary/20">
          {avatarInitials || "AP"}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            <span className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 px-3 py-0.5 rounded-full w-fit mx-auto sm:mx-0 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified
            </span>
          </div>
          <p className="text-lg font-medium text-primary mb-4">{profile.specialization}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Building className="w-4 h-4 text-primary shrink-0" /> {profile.organizationName}
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Award className="w-4 h-4 text-amber-500 shrink-0" /> {profile.experienceYears} Years Experience
            </div>
          </div>
        </div>
      </div>

      {/* Editable Contact Information Form (Only Email & Phone Number) */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Contact Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only your email address and phone number are editable directly.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-xl w-fit">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Credentials locked
          </div>
        </div>

        <form onSubmit={handleSaveContact} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Email Address */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-primary" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.example"
                className="w-full bg-background border rounded-2xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary" /> Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 1234567890"
                className="w-full bg-background border rounded-2xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving || !hasChanges}
              className="gap-2 px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving changes..." : "Save Contact Details"}
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}
