import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { OnboardingLayout } from "../../components/onboarding/OnboardingLayout"
import { LanguageCard } from "../../components/onboarding/LanguageCard"
import { LiveLanguagePreview } from "../../components/onboarding/LiveLanguagePreview"
import { Button } from "../../components/ui/button"
import { useLanguage } from "../../lib/i18n/LanguageContext"
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../../lib/i18n/language-config"
import type { LanguageId } from "../../lib/i18n/language-config"
import { Loader2 } from "lucide-react"

export default function LanguageSelectionPage() {
  const { currentLanguage, setLanguage } = useLanguage()
  const [selectedId, setSelectedId] = useState<LanguageId>(currentLanguage || DEFAULT_LANGUAGE)
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  const handleContinue = () => {
    setIsSaving(true)
    setLanguage(selectedId)
    
    // Simulate slight delay for premium feel, then route to next step
    setTimeout(() => {
      navigate("/onboarding/location")
    }, 600)
  }

  const handleSkip = () => {
    // Preserve default if skipped
    setLanguage(DEFAULT_LANGUAGE)
    navigate("/onboarding/location")
  }

  const selectedConfig = SUPPORTED_LANGUAGES[selectedId] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE]

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={2}
      stepTitle="Language"
    >
      <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            How would you like to use Medireach?
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the language you're most comfortable with. Your preference will shape your Medireach experience where supported.
          </p>
        </div>

        {/* Live Preview Panel */}
        <div className="pt-2 pb-6">
          <LiveLanguagePreview language={selectedConfig} />
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.values(SUPPORTED_LANGUAGES) as any[]).map((lang) => (
            <LanguageCard
              key={lang.id}
              language={lang}
              isSelected={selectedId === lang.id}
              onClick={() => setSelectedId(lang.id as LanguageId)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 border-t">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-10 h-14 text-base rounded-full"
            onClick={handleContinue}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              "Continue"
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            className="w-full sm:w-auto h-14 rounded-full text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
            disabled={isSaving}
          >
            Skip for now
          </Button>
        </div>

      </div>
    </OnboardingLayout>
  )
}
