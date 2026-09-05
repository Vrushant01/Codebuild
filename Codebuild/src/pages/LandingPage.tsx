import React, { useEffect } from "react"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { CoreJourney } from "@/components/landing/CoreJourney"
import { AIAssistantSection } from "@/components/landing/AIAssistantSection"
import { DiscoverySection } from "@/components/landing/DiscoverySection"
import { AppointmentSection } from "@/components/landing/AppointmentSection"
import { FeatureGrid } from "@/components/landing/FeatureGrid"
import { EcosystemSection } from "@/components/landing/EcosystemSection"
import { JoinOrganizationSection } from "@/components/landing/JoinOrganizationSection"
import { FinalCtaSection } from "@/components/landing/FinalCtaSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function LandingPage() {
  // Simple scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <LandingNavbar />
      
      <main>
        <HeroSection />
        <CoreJourney />
        <AIAssistantSection />
        <DiscoverySection />
        <JoinOrganizationSection />
        <AppointmentSection />
        <EcosystemSection />
        <FeatureGrid />
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
