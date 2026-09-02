import React, { useEffect, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { profileService } from "../../lib/profile/profile-service"
import type { Allergy } from "../../lib/profile/profile-types"
import { useTranslation } from "../../lib/i18n/useTranslation"

interface PatientAllergyPanelProps {
  patientId: string
  isAuthorized: boolean
  allergies?: Allergy[] | null
}

export function PatientAllergyPanel({ patientId, isAuthorized, allergies: initialAllergies }: PatientAllergyPanelProps) {
  const { t } = useTranslation()
  const [allergies, setAllergies] = useState<Allergy[] | null>(initialAllergies || null)
  const [loading, setLoading] = useState(!initialAllergies)

  useEffect(() => {
    async function loadAllergies() {
      if (!isAuthorized) {
        setAllergies(null)
        setLoading(false)
        return
      }
      
      if (initialAllergies !== undefined) {
        setAllergies(initialAllergies)
        setLoading(false)
        return
      }

      setLoading(true)
      const data = await profileService.getAllergies()
      setAllergies(data)
      setLoading(false)
    }

    loadAllergies()
  }, [patientId, isAuthorized, initialAllergies])

  if (loading) {
    return (
      <div className="bg-card border rounded-3xl p-6 shadow-sm animate-pulse flex flex-col gap-4">
        <div className="h-6 w-32 bg-muted rounded-full"></div>
        <div className="h-20 w-full bg-muted rounded-2xl"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Do not show anything if not authorized (e.g. Receptionist)
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight uppercase tracking-wide text-red-900 dark:text-red-400">
            {t("allergy.passport")}
          </h3>
          <p className="text-sm font-semibold text-red-700/80 dark:text-red-400/80 mt-0.5">
            {allergies?.length === 1 ? `1 known allergy` : `${allergies?.length || 0} known allergies`}
          </p>
        </div>
      </div>

      {!allergies || allergies.length === 0 ? (
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-4 text-sm font-medium text-muted-foreground border border-red-200/50 dark:border-red-900/20">
          {t("allergy.notProvided")}
        </div>
      ) : (
        <div className="space-y-3">
          {allergies.map(alg => (
            <div key={alg.id} className="bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-red-200/50 dark:border-red-900/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h4 className="font-bold">{alg.name}</h4>
                <span className="text-[10px] uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded font-bold tracking-wider">
                  {alg.category || "Medication"}
                </span>
              </div>
              <div className="text-sm text-foreground/80 font-medium pl-6">
                <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-0.5">{t("allergy.reaction")}</span>
                {alg.reaction}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
