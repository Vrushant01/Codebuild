import React, { useState, useMemo, useEffect } from "react"
import type { Allergy, AllergyCategory } from "../../lib/profile/profile-types"
import { X, ShieldAlert, Search, Pill, Apple, Trees, AlertCircle, Sparkles, Check } from "lucide-react"
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
  { name: "Sulfa drugs", category: "Medication" as AllergyCategory },
  { name: "Peanuts", category: "Food" as AllergyCategory },
  { name: "Milk / Dairy", category: "Food" as AllergyCategory },
  { name: "Eggs", category: "Food" as AllergyCategory },
  { name: "Shellfish", category: "Food" as AllergyCategory },
  { name: "Dust Mites", category: "Environmental" as AllergyCategory },
  { name: "Pollen", category: "Environmental" as AllergyCategory },
  { name: "Latex", category: "Environmental" as AllergyCategory },
  { name: "Insect Stings", category: "Environmental" as AllergyCategory },
  { name: "Other", category: "Other" as AllergyCategory }
]

const QUICK_TAGS = [
  "Rash", 
  "Swelling", 
  "Breathing difficulty", 
  "Stomach upset", 
  "Hives / Itching", 
  "Anaphylaxis", 
  "Dizziness",
  "Nausea"
]

export function AddAllergyModal({ isOpen, onClose, onSave, initialData }: AddAllergyModalProps) {
  const { t } = useTranslation()
  
  const [search, setSearch] = useState("")
  const [selectedName, setSelectedName] = useState("")
  const [customName, setCustomName] = useState("")
  const [category, setCategory] = useState<AllergyCategory>("Medication")
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("moderate")
  const [reaction, setReaction] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format category name safely
  const getCategoryLabel = (cat?: string) => {
    if (!cat) return "Medication"
    const translated = t(`allergy.categories.${cat}`)
    if (translated && !translated.startsWith("ALLERGY.")) return translated
    return cat.charAt(0).toUpperCase() + cat.slice(1)
  }

  // Initialize data for edit mode
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isCommon = COMMON_ALLERGIES.some(a => a.name.toLowerCase() === initialData.name.toLowerCase())
        if (isCommon) {
          setSelectedName(initialData.name)
          setSearch("")
          setCustomName("")
        } else {
          setSelectedName("Other")
          setCustomName(initialData.name)
          setSearch("")
        }
        setCategory(initialData.category || "Medication")
        setSeverity((initialData.severity?.toLowerCase() as any) || "moderate")
        setReaction(initialData.reaction || "")
      } else {
        setSearch("")
        setSelectedName("")
        setCustomName("")
        setCategory("Medication")
        setSeverity("moderate")
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
      if (prev.includes(tag)) return prev
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
        severity,
        reaction: reaction.trim() 
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-card border rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold border border-red-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground">
                {initialData ? t("allergy.editAllergy") : t("allergy.addAllergy")}
              </h2>
              <p className="text-xs text-muted-foreground">Digital Health Passport Entry</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="bg-primary/5 text-primary text-xs p-3.5 rounded-2xl border border-primary/20 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              {t("allergy.safetyBanner")} Attending doctors will see this immediately upon appointment check-in.
            </p>
          </div>

          <form id="add-allergy-form" onSubmit={handleSave} className="space-y-5">
            
            {/* 1. Select Allergy Substance */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>{t("allergy.selectAllergy")} <span className="text-destructive">*</span></span>
                {selectedName && (
                  <button 
                    type="button"
                    onClick={() => setSelectedName("")}
                    className="text-primary font-bold hover:underline normal-case text-xs"
                  >
                    Change substance
                  </button>
                )}
              </label>
              
              {!selectedName ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text"
                      placeholder={t("allergy.searchPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-border/80 rounded-2xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium shadow-xs"
                    />
                  </div>
                  
                  <div className="max-h-44 overflow-y-auto border border-border/80 rounded-2xl divide-y bg-background text-sm shadow-inner p-1">
                    {filteredAllergies.length > 0 ? (
                      filteredAllergies.map(alg => (
                        <button
                          key={alg.name}
                          type="button"
                          onClick={() => handleSelectPredefined(alg.name, alg.category)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-muted rounded-xl transition-colors flex justify-between items-center group"
                        >
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {alg.name === "Other" ? "+ Enter Custom Allergy" : alg.name}
                          </span>
                          {alg.name !== "Other" && (
                            <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-lg border border-border/60">
                              {getCategoryLabel(alg.category)}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <span className="text-xs">{t("allergy.noMatching")}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedName("Other")
                            setCustomName(search.trim())
                          }}
                          className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 transition-all"
                        >
                          + Add "{search}" as custom allergy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/30 rounded-2xl px-4 py-3 flex justify-between items-center shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground text-sm block">
                        {selectedName === "Other" ? (customName || "Custom Allergy") : selectedName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Category: {getCategoryLabel(category)}
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedName("")}
                    className="text-xs text-primary font-bold hover:underline px-2 py-1 bg-primary/10 rounded-lg"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Custom Allergy Name (if Other) */}
              {selectedName === "Other" && (
                <div className="mt-2.5 animate-in fade-in duration-200">
                  <input 
                    type="text" 
                    value={customName} 
                    onChange={e => setCustomName(e.target.value)} 
                    placeholder="Type custom allergy name (e.g. Latex, Specific Drug)..." 
                    className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium shadow-xs"
                    required
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* 2. Category & Severity in Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <span>{t("allergy.category")}</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Medication", "Food", "Environmental", "Other"] as AllergyCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                        category === cat 
                          ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <span>Severity Level</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "mild", label: "Mild", color: "hover:bg-slate-100" },
                    { id: "moderate", label: "Moderate", color: "hover:bg-amber-100" },
                    { id: "severe", label: "Severe", color: "hover:bg-red-100" }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSeverity(lvl.id as any)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                        severity === lvl.id 
                          ? lvl.id === "severe"
                            ? "bg-red-600 text-white border-red-600 shadow-xs"
                            : lvl.id === "moderate"
                            ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                            : "bg-slate-700 text-white border-slate-700 shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. Reaction / What happened? */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <span>{t("allergy.whatHappened")} <span className="text-destructive">*</span></span>
                </label>
                <span className="text-[11px] text-muted-foreground">Tap tags to auto-fill</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {QUICK_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="text-[11px] font-semibold bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground px-2.5 py-1 rounded-lg transition-colors border border-border/60 active:scale-95"
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
                rows={3}
                className="w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm font-medium shadow-inner placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t shrink-0 flex justify-end gap-3 bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl px-5 font-bold">
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit" 
            form="add-allergy-form" 
            disabled={!isValid || isSubmitting}
            className="px-8 shadow-md rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90"
          >
            {isSubmitting ? t("common.loading") : t("allergy.save")}
          </Button>
        </div>

      </div>
    </div>
  )
}
