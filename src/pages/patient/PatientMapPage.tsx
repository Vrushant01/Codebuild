import React, { useState, useEffect } from "react"
import { useLocationStore } from "../../lib/location/LocationContext"
import { useChat } from "../../lib/chat/ChatContext"
import { healthcareService } from "../../lib/healthcare/healthcare-service"
import type { Organization, HealthcareFilterState } from "../../lib/healthcare/types"
import { HealthcareFilters } from "../../components/discovery/HealthcareFilters"
import { OrganizationCard } from "../../components/discovery/OrganizationCard"
import { OrganizationDetailSheet } from "../../components/discovery/OrganizationDetailSheet"
import { HealthcareMap } from "../../components/map/HealthcareMap"
import { MapAvailabilityLegend } from "../../components/map/MapAvailabilityLegend"
import { LocationPermissionBanner } from "../../components/map/LocationPermissionBanner"
import { ChevronUp, Activity } from "lucide-react"
import { cn } from "../../lib/utils"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "../../lib/i18n/useTranslation"
export default function PatientMapPage() {
  const { searchLocation } = useLocationStore()
  const { activeSession } = useChat()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Mobile sheet state (peek, expanded)
  const [sheetState, setSheetState] = useState<"peek" | "expanded">("peek")

  const [filters, setFilters] = useState<HealthcareFilterState>({
    searchQuery: "",
    organizationType: [],
    specializations: [],
    consultationType: "All",
    availability: "All",
    minRating: 0
  })

  // Extract initial context from AI session if present
  useEffect(() => {
    // If AI set a context we'd load it.
  }, [activeSession])

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true)
      const cityToSearch = searchLocation?.city || "Ahmedabad"
      const results = await healthcareService.searchOrganizations(cityToSearch, filters)
      setOrganizations(results)
      setLoading(false)
    }

    fetchOrgs()
  }, [searchLocation, filters])

  const handleOrgSelect = (id: string) => {
    setSelectedOrgId(id)
    setSheetState("peek") // Collapse list on mobile when selecting map marker
  }

  const handleDoctorSelect = (doctorId: string) => {
    navigate(`/app/patient/book/${doctorId}`)
  }

  const city = searchLocation?.city || "Ahmedabad"

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] md:h-screen bg-background relative overflow-hidden">
      
      {/* Desktop Layout: Split View */}
      <div className="hidden lg:flex flex-1 h-full overflow-hidden">
        
        {/* Left Sidebar: Filters & List */}
        <div className="w-[450px] shrink-0 border-r flex flex-col bg-background/50 relative z-10 shadow-xl">
          
          <div className="p-5 border-b bg-background/95 backdrop-blur sticky top-0 z-20 space-y-4">
            
            {/* Context Banner from AI */}
            {activeSession?.symptoms.symptoms.length ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm flex items-start gap-3">
                <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Based on your chat</p>
                  <p className="text-muted-foreground mt-0.5 capitalize line-clamp-1">
                    Symptoms: {activeSession.symptoms.symptoms.join(", ")}
                  </p>
                </div>
              </div>
            ) : null}

            <div>
              <h1 className="text-xl font-heading font-bold">{t("map.findHealthcare")}</h1>
              <p className="text-sm text-muted-foreground">Near {city}</p>
            </div>
            
            <LocationPermissionBanner />
            <HealthcareFilters filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="flex-1 overflow-y-auto p-5 pb-24 scroll-smooth">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : organizations.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {organizations.length} results
                </p>
                {organizations.map(org => (
                  <OrganizationCard 
                    key={org.id} 
                    organization={org} 
                    isSelected={org.id === selectedOrgId}
                    onClick={() => handleOrgSelect(org.id)}
                    onActionClick={() => handleOrgSelect(org.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>No healthcare places found.</p>
                <p className="text-sm mt-1">Try adjusting your filters or location.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="flex-1 relative bg-muted">
          <HealthcareMap 
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            onOrgSelect={handleOrgSelect}
            centerCity={city}
          />
          <div className="absolute bottom-6 right-6 z-[400]">
            <MapAvailabilityLegend />
          </div>
        </div>

      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1 relative flex flex-col">
        
        {/* Mobile Header / Filters overlaying map */}
        <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-background/90 to-transparent pb-8 pt-4">
          <div className="bg-background shadow-lg rounded-xl p-3 border">
             <LocationPermissionBanner />
             <HealthcareFilters filters={filters} onFilterChange={setFilters} />
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 w-full bg-muted relative">
          <HealthcareMap 
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            onOrgSelect={handleOrgSelect}
            centerCity={city}
          />
          <div className="absolute top-32 right-4 z-[400] scale-90 origin-top-right pointer-events-none">
            <MapAvailabilityLegend />
          </div>
        </div>

        {/* Mobile Bottom Sheet (Simulated) */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-background border-t rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out flex flex-col",
          sheetState === "peek" ? "translate-y-[calc(100%-140px)]" : "translate-y-0 h-[85%]"
        )}>
          
          {/* Handle */}
          <div 
            className="w-full flex items-center justify-center p-4 cursor-ns-resize"
            onClick={() => setSheetState(sheetState === "peek" ? "expanded" : "peek")}
          >
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
          </div>
          
          <div className="px-5 pb-3 flex justify-between items-center" onClick={() => setSheetState("expanded")}>
            <div>
              <h3 className="font-semibold text-lg">{organizations.length} results</h3>
              <p className="text-xs text-muted-foreground">Near {city}</p>
            </div>
            {sheetState === "peek" && (
              <ChevronUp className="w-5 h-5 text-muted-foreground animate-bounce" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
             {loading ? (
                <div className="space-y-4 pt-2">
                  {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
                </div>
              ) : organizations.length > 0 ? (
                organizations.map(org => (
                  <OrganizationCard 
                    key={org.id} 
                    organization={org} 
                    isSelected={org.id === selectedOrgId}
                    onClick={() => handleOrgSelect(org.id)}
                    onActionClick={() => handleOrgSelect(org.id)}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No places found.
                </div>
              )}
          </div>
        </div>

      </div>

      {/* Organization Detail Overlay */}
      {selectedOrgId && (
        <OrganizationDetailSheet 
          organizationId={selectedOrgId} 
          onClose={() => setSelectedOrgId(null)} 
          onDoctorSelect={handleDoctorSelect}
        />
      )}

    </div>
  )
}
