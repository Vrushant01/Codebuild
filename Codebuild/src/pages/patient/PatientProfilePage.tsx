import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PatientIdentityCard } from "../../components/profile/PatientIdentityCard"
import { PatientQRModal } from "../../components/profile/PatientQRModal"
import { MedicalSummaryCard } from "../../components/profile/MedicalSummaryCard"
import { MedicalHistoryTimeline } from "../../components/profile/MedicalHistoryTimeline"
import { AllergyCard } from "../../components/profile/AllergyCard"
import { AddAllergyModal } from "../../components/profile/AddAllergyModal"
import { AllergyDeleteDialog } from "../../components/profile/AllergyDeleteDialog"
import { ProfileSettings } from "../../components/profile/ProfileSettings"

import { profileService } from "../../lib/profile/profile-service"
import type { PatientProfile, Allergy, HistoryTimelineItem, ProfilePreferences } from "../../lib/profile/profile-types"
import { User, Activity, Settings as SettingsIcon, ShieldAlert, History, Edit2, FileText, ChevronRight } from "lucide-react"
import { useTranslation } from "../../lib/i18n/useTranslation"

type ProfileTab = "History" | "Allergies" | "Settings"

export default function PatientProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ProfileTab>("History")
  
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [timeline, setTimeline] = useState<HistoryTimelineItem[]>([])
  const [preferences, setPreferences] = useState<ProfilePreferences | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [addAllergyModalOpen, setAddAllergyModalOpen] = useState(false)
  const [allergyToEdit, setAllergyToEdit] = useState<Allergy | undefined>(undefined)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [allergyToDelete, setAllergyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, a, tLine, pref, s] = await Promise.all([
        profileService.getProfile(),
        profileService.getAllergies(),
        profileService.getHistoryTimeline(),
        profileService.getPreferences(),
        profileService.getMedicalSummary()
      ])
      setProfile(p)
      setAllergies(a)
      setTimeline(tLine)
      setPreferences(pref)
      setSummary(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveAllergy = async (allergyData: any) => {
    if (allergyToEdit) {
      await profileService.updateAllergy(allergyToEdit.id, allergyData)
    } else {
      await profileService.addAllergy(allergyData)
    }
    await loadData()
  }

  const handleEditAllergy = (allergy: Allergy) => {
    setAllergyToEdit(allergy)
    setAddAllergyModalOpen(true)
  }

  const handleOpenAddAllergy = () => {
    setAllergyToEdit(undefined)
    setAddAllergyModalOpen(true)
  }

  const requestRemoveAllergy = (id: string) => {
    setAllergyToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmRemoveAllergy = async () => {
    if (!allergyToDelete) return
    setIsDeleting(true)
    try {
      await profileService.removeAllergy(allergyToDelete)
      await loadData()
      setDeleteDialogOpen(false)
      setAllergyToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdatePreferences = async (updates: Partial<ProfilePreferences>) => {
    const newPrefs = await profileService.updatePreferences(updates)
    setPreferences(newPrefs)
  }

  if (loading || !profile || !preferences) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse space-y-4 w-full max-w-sm">
          <div className="h-48 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-background">
      
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b px-4 py-3 flex items-center justify-center">
        <span className="font-semibold text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> {t("navigation.profile")}
        </span>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8">
        
        {/* LEFT COLUMN: Identity & Summary */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          <PatientIdentityCard 
            name={profile.name}
            patientId={profile.patientId}
            avatarInitials={profile.avatarInitials}
            onShowQR={() => setQrModalOpen(true)}
          />

          {/* Allergy Passport Summary Block */}
          <button 
            onClick={() => navigate("/app/patient/profile/history")}
            className="w-full bg-card border rounded-[2rem] p-5 sm:p-6 text-left group hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading font-bold text-lg">Medical History</h3>
            <p className="text-muted-foreground text-sm mt-1">
              View your past cases, allergies, and health journey.
            </p>
          </button>

          {summary && (
            <MedicalSummaryCard 
              activeCasesCount={summary.activeCasesCount}
              activeMedicinesCount={summary.activeMedicinesCount}
              allergiesCount={summary.allergiesCount}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Details & Tabs */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6 p-1 bg-muted/50 rounded-2xl w-max">
            <button
              onClick={() => setActiveTab("History")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "History" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setActiveTab("Allergies")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "Allergies" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              {t("allergy.title")}
            </button>
            <button
              onClick={() => setActiveTab("Settings")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "Settings" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              {t("navigation.settings")}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === "History" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-heading font-bold">Medical History</h2>
                  <p className="text-muted-foreground mt-1">Your previous healthcare interactions and records.</p>
                </div>
                <MedicalHistoryTimeline items={timeline} />
              </div>
            )}

            {activeTab === "Allergies" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-heading font-bold">{t("allergy.title")}</h2>
                    <p className="text-muted-foreground mt-1">{t("allergy.subtitle")}</p>
                  </div>
                  <button 
                    onClick={handleOpenAddAllergy}
                    className="bg-primary text-primary-foreground hover:opacity-90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity flex items-center gap-2"
                  >
                    <span>+</span> {t("allergy.addAllergy")}
                  </button>
                </div>
                
                {allergies.length === 0 ? (
                  <div className="text-center p-12 bg-card rounded-3xl border border-dashed">
                    <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg">{t("allergy.noAllergies")}</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">{t("allergy.noAllergiesDesc")}</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {allergies.map(alg => (
                      <AllergyCard 
                        key={alg.id} 
                        allergy={alg} 
                        onEdit={handleEditAllergy}
                        onRemove={requestRemoveAllergy} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-heading font-bold">Account Settings</h2>
                  <p className="text-muted-foreground mt-1">Manage your preferences and security.</p>
                </div>
                <ProfileSettings 
                  preferences={preferences} 
                  onUpdate={handleUpdatePreferences} 
                />
              </div>
            )}
          </div>

        </div>
      </div>

      <PatientQRModal 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        name={profile.name}
        patientId={profile.patientId}
      />

      <AddAllergyModal 
        isOpen={addAllergyModalOpen}
        onClose={() => setAddAllergyModalOpen(false)}
        onSave={handleSaveAllergy}
        initialData={allergyToEdit}
      />

      <AllergyDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmRemoveAllergy}
        isDeleting={isDeleting}
      />

    </div>
  )
}
