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
import { MOCK_LOCATIONS } from "../../lib/location/mock-locations"
import { 
  ChevronUp, 
  Activity, 
  Navigation, 
  MapPin, 
  Loader2, 
  Search, 
  X, 
  Check, 
  Building, 
  ChevronRight,
  Sparkles
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "../../lib/i18n/useTranslation"

const POPULAR_CITIES = [
  { name: "Vadodara", lat: 22.3072, lng: 73.1812, region: "Gujarat" },
  { name: "Surat", lat: 21.1702, lng: 72.8311, region: "Gujarat" },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, region: "Gujarat" },
  { name: "Rajkot", lat: 22.3039, lng: 70.8022, region: "Gujarat" },
  { name: "Gandhinagar", lat: 23.2156, lng: 72.6369, region: "Gujarat" },
  { name: "Bhavnagar", lat: 21.7645, lng: 72.1519, region: "Gujarat" },
  { name: "Jamnagar", lat: 22.4707, lng: 70.0577, region: "Gujarat" },
  { name: "Anand", lat: 22.5645, lng: 72.9289, region: "Gujarat" },
  { name: "Navsari", lat: 20.9500, lng: 72.9300, region: "Gujarat" },
  { name: "Bharuch", lat: 21.7051, lng: 72.9959, region: "Gujarat" },
  { name: "Valsad", lat: 20.5992, lng: 72.9342, region: "Gujarat" },
  { name: "Mehsana", lat: 23.5880, lng: 72.3693, region: "Gujarat" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, region: "Maharashtra" },
  { name: "Delhi", lat: 28.6139, lng: 77.2090, region: "Delhi" },
  { name: "Pune", lat: 18.5204, lng: 73.8567, region: "Maharashtra" },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, region: "Karnataka" }
]

export default function PatientMapPage() {
  const { searchLocation, deviceLocation, requestDeviceLocation, setSearchLocation } = useLocationStore()
  const { activeSession } = useChat()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const userLocation = deviceLocation || (searchLocation?.latitude && searchLocation?.longitude ? searchLocation : null)

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLocating, setIsLocating] = useState(false)
  const [isCityModalOpen, setIsCityModalOpen] = useState(false)
  const [citySearchQuery, setCitySearchQuery] = useState("")
  
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

  // Default to Surat if no location is selected yet
  useEffect(() => {
    if (!searchLocation) {
      setSearchLocation({
        id: "loc_vadodara",
        city: "Vadodara",
        label: "Vadodara, Gujarat",
        region: "Gujarat",
        country: "India",
        latitude: 22.3072,
        longitude: 73.1812,
        source: "device"
      })
    }
  }, [searchLocation, setSearchLocation])

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true)
      const cityToSearch = searchLocation?.city || "Vadodara"
      const results = await healthcareService.searchOrganizations(cityToSearch, filters)
      setOrganizations(results)
      setLoading(false)
    }

    fetchOrgs()
  }, [searchLocation, filters])

  const handleOrgSelect = (id: string) => {
    setSelectedOrgId(id)
    setSheetState("peek")
  }

  const handleDoctorSelect = (doctorId: string) => {
    navigate(`/app/patient/book/${doctorId}`)
  }

  const handleLocateMe = async () => {
    setIsLocating(true)
    try {
      await requestDeviceLocation()
      setIsCityModalOpen(false)
    } finally {
      setIsLocating(false)
    }
  }

  const handleSelectCity = (c: { name: string; lat: number; lng: number; region?: string }) => {
    setSearchLocation({
      id: `loc_${c.name.toLowerCase().replace(/\s+/g, '_')}`,
      city: c.name,
      label: `${c.name}, ${c.region || "India"}`,
      region: c.region || "Gujarat",
      country: "India",
      latitude: c.lat,
      longitude: c.lng,
      source: "manual"
    })
    setIsCityModalOpen(false)
  }

  const handleCustomCitySubmit = (cityName: string) => {
    if (!cityName.trim()) return
    const matched = MOCK_LOCATIONS.find(l => l.city.toLowerCase() === cityName.trim().toLowerCase())
    if (matched) {
      handleSelectCity({ name: matched.city, lat: matched.latitude, lng: matched.longitude, region: matched.region })
    } else {
      // Fallback coordinate mapping or center around Gujarat/India
      handleSelectCity({
        name: cityName.trim(),
        lat: 22.3072,
        lng: 73.1812,
        region: "Gujarat"
      })
    }
  }

  const city = searchLocation?.city || "Vadodara"

  const filteredLocations = MOCK_LOCATIONS.filter(loc =>
    loc.city.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    loc.label.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    loc.region.toLowerCase().includes(citySearchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] md:h-screen bg-background relative overflow-hidden">
      
      {/* Desktop Layout: Split View */}
      <div className="hidden lg:flex flex-1 h-full overflow-hidden">
        
        {/* Left Sidebar: Filters & List */}
        <div className="w-[460px] shrink-0 border-r flex flex-col bg-background/50 relative z-10 shadow-xl">
          
          <div className="p-5 border-b bg-background/95 backdrop-blur sticky top-0 z-20 space-y-3.5">
            
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

            {/* Header with City Switcher & Live GPS */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-heading font-bold">{t("map.findHealthcare")}</h1>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="group mt-1 flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-lg border border-border/60"
                  title="Click to change city manually"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>Near <strong>{city}</strong></span>
                  <span className="text-[10px] text-primary font-bold ml-1 px-1.5 py-0.5 bg-primary/10 rounded-md">Change</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Building className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Cities</span>
                </button>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  {isLocating ? "Locating..." : "Live GPS"}
                </button>
              </div>
            </div>

            {/* Quick Cities Horizontal Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> City:
              </span>
              {POPULAR_CITIES.slice(0, 8).map(c => {
                const isActive = city.toLowerCase() === c.name.toLowerCase()
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="shrink-0 text-xs px-2 py-1 rounded-lg font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 flex items-center gap-0.5"
              >
                More +
              </button>
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {organizations.length} places in {city}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCityModalOpen(true)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Change City <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
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
              <div className="py-12 text-center text-muted-foreground space-y-3">
                <Building className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <div>
                  <p className="font-bold text-foreground">No healthcare places in {city}.</p>
                  <p className="text-sm mt-1">Try switching to another city or adjusting filters.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {POPULAR_CITIES.slice(0, 4).map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleSelectCity(c)}
                      className="text-xs font-bold px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all"
                    >
                      Search {c.name}
                    </button>
                  ))}
                </div>
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
            userLocation={userLocation}
            onRequestLocation={requestDeviceLocation}
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
          <div className="bg-background shadow-lg rounded-2xl p-3 border space-y-2.5">
             <div className="flex items-center justify-between gap-2">
               <div>
                 <h2 className="font-bold text-sm">Find Healthcare</h2>
                 <button
                   type="button"
                   onClick={() => setIsCityModalOpen(true)}
                   className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                 >
                   <MapPin className="w-3 h-3 text-primary animate-pulse" /> Near <strong>{city}</strong>
                   <span className="text-[10px] text-primary font-bold ml-1 px-1.5 py-0.2 bg-primary/10 rounded">Change</span>
                 </button>
               </div>
               <div className="flex items-center gap-1.5">
                 <button
                   type="button"
                   onClick={() => setIsCityModalOpen(true)}
                   className="text-[11px] font-bold bg-muted hover:bg-muted/80 text-foreground border px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                 >
                   <Building className="w-3 h-3" /> City
                 </button>
                 <button
                   type="button"
                   onClick={handleLocateMe}
                   disabled={isLocating}
                   className="text-[11px] font-bold bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm disabled:opacity-50"
                 >
                   <Navigation className="w-3 h-3" />
                   {isLocating ? "Locating..." : "Live GPS"}
                 </button>
               </div>
             </div>

             {/* Mobile Quick City Bar */}
             <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
               {POPULAR_CITIES.slice(0, 6).map(c => {
                 const isActive = city.toLowerCase() === c.name.toLowerCase()
                 return (
                   <button
                     key={c.name}
                     type="button"
                     onClick={() => handleSelectCity(c)}
                     className={`shrink-0 text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all border ${
                       isActive 
                         ? "bg-primary text-primary-foreground border-primary" 
                         : "bg-muted/50 text-muted-foreground border-border/50"
                     }`}
                   >
                     {c.name}
                   </button>
                 )
               })}
             </div>

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
            userLocation={userLocation}
            onRequestLocation={requestDeviceLocation}
          />
          <div className="absolute top-44 right-4 z-[400] scale-90 origin-top-right pointer-events-none">
            <MapAvailabilityLegend />
          </div>
        </div>

        {/* Mobile Bottom Sheet */}
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
              <h3 className="font-semibold text-lg">{organizations.length} places in {city}</h3>
              <p className="text-xs text-muted-foreground">Tap marker or card to view details</p>
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

      {/* Manual City / Place Selection Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border rounded-[2rem] p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Select Location / City</h3>
                  <p className="text-xs text-muted-foreground">Choose a city or enter any place manually</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCityModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Live GPS Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="w-full p-3.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 flex items-center justify-between font-bold text-sm transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Navigation className="w-4 h-4 text-primary group-hover:rotate-45 transition-transform" />
                <span>Use Current Live GPS Location</span>
              </div>
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Manual Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && citySearchQuery.trim()) {
                    handleCustomCitySubmit(citySearchQuery)
                  }
                }}
                placeholder="Type city or area name (e.g. Vadodara, Surat, Mumbai)..."
                className="w-full pl-10 pr-10 py-3 bg-background border border-border/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                autoFocus
              />
              {citySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCitySearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* If searching: Show filtered locations */}
            {citySearchQuery.trim() ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Matching Places</p>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map(loc => {
                    const isSelected = city.toLowerCase() === loc.city.toLowerCase()
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectCity({ name: loc.city, lat: loc.latitude, lng: loc.longitude, region: loc.region })}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                          isSelected 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-card border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <p className="font-bold text-sm">{loc.city}</p>
                            <p className="text-xs text-muted-foreground">{loc.label}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    )
                  })
                ) : (
                  <div className="p-4 bg-muted/40 rounded-2xl border text-center space-y-2">
                    <p className="text-xs text-muted-foreground">No predefined coordinate for "{citySearchQuery}".</p>
                    <button
                      type="button"
                      onClick={() => handleCustomCitySubmit(citySearchQuery)}
                      className="text-xs font-bold px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-sm hover:bg-primary/90 transition-all"
                    >
                      Set "{citySearchQuery}" as search location
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* If not searching: Show popular city cards */
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Popular Cities
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                  {POPULAR_CITIES.map(c => {
                    const isSelected = city.toLowerCase() === c.name.toLowerCase()
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-md font-bold" 
                            : "bg-muted/30 hover:bg-muted border-border/80 text-foreground font-semibold"
                        }`}
                      >
                        <p className="text-sm">{c.name}</p>
                        <p className={`text-[11px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{c.region}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCityModalOpen(false)}
                className="text-xs font-bold px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
