import React from "react"
import type { Allergy } from "../../lib/profile/profile-types"
import { ShieldAlert, Trash2, Edit2 } from "lucide-react"
import { useTranslation } from "../../lib/i18n/useTranslation"

interface AllergyCardProps {
  allergy: Allergy
  onEdit: (allergy: Allergy) => void
  onRemove: (id: string) => void
  readOnly?: boolean
}

export function AllergyCard({ allergy, onEdit, onRemove, readOnly = false }: AllergyCardProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-card border rounded-3xl p-5 sm:p-6 shadow-sm relative group hover:shadow-md transition-shadow">
      
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg leading-tight">{allergy.name}</h4>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mt-1 bg-muted text-muted-foreground">
              {t(`allergy.categories.${allergy.category}`) || allergy.category}
            </span>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(allergy)}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
              title={t("allergy.editAllergy")}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onRemove(allergy.id)}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              title={t("allergy.remove")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-dashed text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{t("allergy.reaction")}</span>
          <span className="font-medium text-foreground">{allergy.reaction}</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
        <span>{t("allergy.dateAdded")}: {new Date(allergy.dateAdded).toLocaleDateString()}</span>
      </div>

    </div>
  )
}
