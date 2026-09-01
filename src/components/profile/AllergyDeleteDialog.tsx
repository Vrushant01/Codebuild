import React from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "../../lib/i18n/useTranslation"

interface AllergyDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function AllergyDeleteDialog({ isOpen, onClose, onConfirm, isDeleting }: AllergyDeleteDialogProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-background border rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold mb-2">{t("allergy.removeConfirmTitle")}</h2>
        <p className="text-muted-foreground mb-8">
          {t("allergy.removeConfirmDesc")}
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={onConfirm} 
            disabled={isDeleting}
            variant="destructive"
            className="w-full rounded-xl py-6"
          >
            {isDeleting ? t("common.loading") : t("allergy.remove")}
          </Button>
          <Button 
            onClick={onClose} 
            disabled={isDeleting}
            variant="outline"
            className="w-full rounded-xl py-6"
          >
            {t("common.cancel")}
          </Button>
        </div>
        
      </div>
    </div>
  )
}
