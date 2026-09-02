import React, { useState, useMemo, useEffect } from "react"
import type { Allergy, AllergyCategory } from "../../lib/profile/profile-types"
import { X, ShieldAlert, Search } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "../../lib/i18n/useTranslation"

interface AddAllergyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (allergy: any) => Promise<void>
  initialData?: Allergy
}

const COMMON_ALLERGIES = [
  { name: "Penicillin", category: "Medication" as AllergyCategory },
  { name: "Amoxicillin", category: "Medication" as AllergyCategory },
  { name: "Aspirin", category: "Medication" as AllergyCategory },
  { name: "Ibuprofen", category: "Medication" as AllergyCategory },
  { name: "Peanuts", category: "Food" as AllergyCategory },
  { name: "Milk", category: "Food" as AllergyCategory },
  { name: "Eggs", category: "Food" as AllergyCategory },
  { name: "Shellfish", category: "Food" as AllergyCategory },
  { name: "Dust", category: "Environmental" as AllergyCategory },
  { name: "Pollen", category: "Environmental" as AllergyCategory },
  { name: "Latex", category: "Environmental" as AllergyCategory },
  { name: "Other", category: "Other" as AllergyCategory }
]

const QUICK_TAGS = ["Rash", "Swelling", "Breathing difficulty", "Stomach upset"]

export function AddAllergyModal({ isOpen, onClose, onSave, initialData }: AddAllergyModalProps) {
  const { t } = useTranslation()
  
  const [search, setSearch] = useState("")
  const [selectedName, setSelectedName] = useState("")
  const [customName, setCustomName] = useState("")
  const [category, setCategory] = useState<AllergyCategory>("Medication")
  const [reaction, setReaction] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize data for edit mode
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // If editing
        const isCommon = COMMON_ALLERGIES.some(a => a.name === initialData.name)
        if (isCommon) {
          setSelectedName(initialData.name)
          setSearch("")
          setCustomName("")
        } else {
          setSelectedName("Other")
          setCustomName(initialData.name)
          setSearch("")
        }
        setCategory(initialData.category)
        setReaction(initialData.reaction)
      } else {
        // Reset for new
        setSearch("")
        setSelectedName("")
        setCustomName("")
        setCategory("Medication")
        setReaction("")
      }
    }
  }, [isOpen, initialData])

  const filteredAllergies = useMemo(() => {
    if (!search) return COMMON_ALLERGIES
    return COMMON_ALLERGIES.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  if (!isOpen) return null

  const handleSelectPredefined = (allergyName: string, allergyCat: AllergyCategory) => {
    setSelectedName(allergyName)
    if (allergyName !== "Other") {
      setCategory(allergyCat)
    }
    setSearch("")
  }

  const handleAddTag = (tag: string) => {
    setReaction(prev => {
      const sep = prev.trim() ? ", " : ""
      return prev + sep + tag
    })
  }

  const finalName = selectedName === "Other" ? customName.trim() : selectedName
  const isValid = finalName.length > 0 && reaction.trim().length > 0

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    
    setIsSubmitting(true)
    try {
      await onSave({ 
        name: finalName, 
        category, 
        reaction: reaction.trim() 
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-background border rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 sm:p-6 border-b shrink-0">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> 
            {initialData ? t("allergy.editAllergy") : t("allergy.addAllergy")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="bg-primary/5 text-primary text-sm p-4 rounded-xl border border-primary/20">
            {t("allergy.safetyBanner")}
          </div>

          <form id="add-allergy-form" onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Select Allergy */}
            <div className="space-y-3">
              <label className="text-sm font-semibold ml-1">{t("allergy.selectAllergy")} <span className="text-destructive">*</span></label>
              
              {!selectedName ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text"
                      placeholder={t("allergy.searchPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border rounded-xl divide-y bg-card text-sm shadow-sm">
                    {filteredAllergies.length > 0 ? (
                      filteredAllergies.map(alg => (
                        <button
                          key={alg.name}
                          type="button"
                          onClick={() => handleSelectPredefined(alg.name, alg.category)}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex justify-between items-center"
                        >
                          <span className="font-medium">{alg.name === "Other" ? t("allergy.categories.Other") : alg.name}</span>
                          {alg.name !== "Other" && (
                            <span className="text-[10px] uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">{t(`allergy.categories.${alg.category}`)}</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <span>{t("allergy.noMatching")}</span>
                        <button 
                          type="button"
                          onClick={() => handleSelectPredefined("Other", "Other")}
                          className="text-primary font-semibold hover:underline"
                        >
                          + {t("allergy.addCustom")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/50 border rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="font-semibold">{selectedName === "Other" ? t("allergy.categories.Other") : selectedName}</span>
                    <button 
                      type="button"
                      onClick={() => setSelectedName("")}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      {t("common.change")}
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Allergy Name (if Other) */}
              {selectedName === "Other" && (
                <div className="mt-3 animate-in fade-in zoom-in-95 duration-200">
                  <input 
                    type="text" 
                    value={customName} 
                    onChange={e => setCustomName(e.target.value)} 
                    placeholder={t("allergy.customAllergy")} 
                    className="w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    required
                  />
                </div>
              )}
            </div>

            {/* 2. Category (Only show explicit selector if custom allergy) */}
            {selectedName === "Other" && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-sm font-semibold ml-1">{t("allergy.category")} <span className="text-destructive">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Medication", "Food", "Environmental", "Other"] as AllergyCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 text-sm font-medium rounded-xl border transition-colors ${
                        category === cat 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-card hover:bg-muted"
                      }`}
                    >
                      {t(`allergy.categories.${cat}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Reaction / What happened? */}
            <div className="space-y-3">
              <label className="text-sm font-semibold ml-1">{t("allergy.whatHappened")} <span className="text-destructive">*</span></label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors border"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <textarea 
                value={reaction} 
                onChange={e => setReaction(e.target.value)} 
                placeholder={t("allergy.reactionPlaceholder")}
                required
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>

          </form>
        </div>

        <div className="p-5 sm:p-6 border-t shrink-0 flex justify-end gap-3 bg-muted/10 rounded-b-3xl">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit" 
            form="add-allergy-form" 
            disabled={!isValid || isSubmitting}
            className="px-8 shadow-md rounded-xl"
          >
            {isSubmitting ? t("common.loading") : t("allergy.save")}
          </Button>
        </div>

      </div>
    </div>
  )
}
