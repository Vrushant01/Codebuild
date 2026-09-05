import React from "react"
import type { Allergy } from "../../lib/profile/profile-types"
import { ShieldAlert, Trash2, Edit3, Pill, Apple, Trees, AlertCircle } from "lucide-react"
import { useTranslation } from "../../lib/i18n/useTranslation"

interface AllergyCardProps {
  allergy: Allergy
  onEdit: (allergy: Allergy) => void
  onRemove: (id: string) => void
  readOnly?: boolean
}

export function AllergyCard({ allergy, onEdit, onRemove, readOnly = false }: AllergyCardProps) {
  const { t } = useTranslation()

  // Format category name safely
  const getCategoryLabel = (cat?: string) => {
    if (!cat) return "Medication"
    const translated = t(`allergy.categories.${cat}`)
    if (translated && !translated.startsWith("ALLERGY.")) return translated
    return cat.charAt(0).toUpperCase() + cat.slice(1)
  }

  const getCategoryTheme = (cat?: string) => {
    const lower = (cat || "").toLowerCase()
    if (lower.includes("food") || lower.includes("peanut") || lower.includes("milk")) {
      return {
        bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        icon: <Apple className="w-3 h-3 text-amber-500" />
      }
    }
    if (lower.includes("env") || lower.includes("dust") || lower.includes("pollen") || lower.includes("latex")) {
      return {
        bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        icon: <Trees className="w-3 h-3 text-emerald-500" />
      }
    }
    if (lower.includes("other")) {
      return {
        bg: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
        icon: <AlertCircle className="w-3 h-3 text-slate-500" />
      }
    }
    return {
      bg: "bg-primary/10 text-primary border-primary/20",
      icon: <Pill className="w-3 h-3 text-primary" />
    }
  }

  const theme = getCategoryTheme(allergy.category)
  const categoryLabel = getCategoryLabel(allergy.category)

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
      
      <div>
        {/* Top Header with Icon, Name, Category and Actions */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-foreground leading-tight">{allergy.name}</h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${theme.bg}`}>
                  {theme.icon}
                  <span>{categoryLabel}</span>
                </span>
                {allergy.severity && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    allergy.severity.toLowerCase() === "severe"
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : allergy.severity.toLowerCase() === "mild"
                      ? "bg-muted text-muted-foreground border-border"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}>
                    {allergy.severity}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Edit & Delete Action Buttons */}
          {!readOnly && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                type="button"
                onClick={() => onEdit(allergy)}
                className="w-8 h-8 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-all border border-border/60 hover:border-primary/30 active:scale-95 shadow-2xs"
                title="Edit allergy"
                aria-label="Edit allergy"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => onRemove(allergy.id)}
                className="w-8 h-8 rounded-xl bg-muted/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all border border-border/60 hover:border-destructive/30 active:scale-95 shadow-2xs"
                title="Remove allergy"
                aria-label="Remove allergy"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Reaction Description Box */}
        <div className="bg-muted/30 rounded-2xl p-3.5 border border-dashed border-border/80 text-sm mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            {t("allergy.reaction")}
          </span>
          <p className="font-medium text-foreground leading-relaxed">
            {allergy.reaction || "No specific reaction specified."}
          </p>
        </div>
      </div>
      
      {/* Footer metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40 mt-1">
        <span className="flex items-center gap-1">
          <span>{t("allergy.dateAdded")}:</span>
          <strong className="text-foreground/80 font-semibold">{new Date(allergy.dateAdded).toLocaleDateString()}</strong>
        </span>
        <span className="text-[11px] font-medium text-primary">Verified EHR</span>
      </div>

    </div>
  )
}
