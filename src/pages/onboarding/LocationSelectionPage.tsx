import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navigation, MapPin, CheckCircle2, AlertCircle, Loader2, Search } from "lucide-react"
import { ProgressIndicator } from "../../components/onboarding/ProgressIndicator"
import { LocationVisualPreview } from "../../components/location/LocationVisualPreview"
import { LocationSearch } from "../../components/location/LocationSearch"
import { Button } from "../../components/ui/button"
import { useLocationStore } from "../../lib/location/LocationContext"
import type { LocationData } from "../../lib/location/mock-locations"

export default function LocationSelectionPage() {
  const navigate = useNavigate()
  const { 
    deviceLocation, 
    searchLocation, 
    permissionState, 
    requestDeviceLocation, 
    setSearchLocation 
  } = useLocationStore()

  const [mode, setMode] = useState<"initial" | "search">("initial")
  const [isContinuing, setIsContinuing] = useState(false)

  const handleUseLocation = async () => {
    await requestDeviceLocation()
  }

  const handleManualSearch = () => {
    setMode("search")
  }

  const handleLocationSelected = (loc: LocationData) => {
    setSearchLocation(loc)
  }

  const handleContinue = () => {
    setIsContinuing(true)
    // Simulate slight transition delay, then hand off to patient dashboard placeholder (for Prompt 8 to pick up)
    setTimeout(() => {
      navigate("/app/patient/chat")
    }, 600)
  }

  // Derived state to determine if we have a resolved location ready to continue
  const hasResolvedLocation = !!searchLocation

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[40%_60%] xl:grid-cols-[35%_65%]">
      {/* Desktop Visual Panel - Overriding OnboardingLayout to use our specific map visual */}
      <LocationVisualPreview />

      {/* Content Panel */}
      <div className="flex flex-col relative bg-background min-h-[calc(100vh-65px)] lg:min-h-screen">
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg font-heading font-bold text-primary">Medireach</span>
          </div>
          <ProgressIndicator current={2} total={2} />
        </div>

        <div className="hidden lg:block absolute top-8 right-12">
          <ProgressIndicator current={2} total={2} label="Location" showLabel />
        </div>
        
        <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-8 md:px-12 lg:px-24 max-w-3xl mx-auto w-full">
          <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">
                Where should we look for healthcare?
              </h2>
              <p className="text-lg text-muted-foreground">
                Use your location to discover healthcare nearby, or search for a place manually.
              </p>
            </div>

            {hasResolvedLocation ? (
              <div className="space-y-8">
                {/* Success State */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading text-foreground">Location selected</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchLocation.label}
                    </p>
                    {searchLocation.source === "device" && (
                      <p className="text-sm text-primary font-medium mt-2 bg-primary/10 inline-block px-3 py-1 rounded-full">
                        Using device location
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 border-t pt-8">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-10 h-14 text-base rounded-full"
                    onClick={handleContinue}
                    disabled={isContinuing}
                  >
                    {isContinuing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isContinuing ? "Preparing your dashboard..." : "Continue"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="w-full sm:w-auto h-14 rounded-full"
                    onClick={() => {
                      // Allow changing location
                      setMode("search")
                    }}
                    disabled={isContinuing}
                  >
                    Change location
                  </Button>
                </div>
              </div>
            ) : mode === "initial" ? (
              <div className="space-y-8">
                {/* Initial Request / Error State */}
                {permissionState === "denied" && (
                  <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">That's okay.</p>
                      <p className="text-sm text-muted-foreground">Search for a city or area instead.</p>
                    </div>
                  </div>
                )}
                
                {permissionState === "unavailable" && (
                  <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Location isn't available on this device.</p>
                      <p className="text-sm text-muted-foreground">Search for a city or area instead.</p>
                    </div>
                  </div>
                )}

                <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {permissionState === "requesting" ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Navigation className="w-8 h-8" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Use your current location</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Medireach can use your location to show healthcare options nearby.
                    </p>
                  </div>

                  <Button 
                    className="w-full rounded-full h-12 text-base font-medium"
                    onClick={handleUseLocation}
                    disabled={permissionState === "requesting"}
                  >
                    {permissionState === "requesting" ? "Requesting..." : "Use my location"}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-semibold">Or</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full rounded-full h-12 text-base font-medium"
                  onClick={handleManualSearch}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search a location manually
                </Button>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                {/* Manual Search Mode */}
                <div className="space-y-4">
                  <LocationSearch onSelect={handleLocationSelected} autoFocus />
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground"
                    onClick={() => setMode("initial")}
                  >
                    Back to device location
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
