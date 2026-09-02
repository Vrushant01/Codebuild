import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navigation, MapPin, CheckCircle2, AlertCircle, Loader2, Search, Sparkles, RefreshCw } from "lucide-react"
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
    setSearchLocation,
    clearLocation 
  } = useLocationStore()

  const [mode, setMode] = useState<"initial" | "search">("initial")
  const [isChanging, setIsChanging] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isContinuing, setIsContinuing] = useState(false)
  const [locationStatusText, setLocationStatusText] = useState("")

  const handleUseLocation = async () => {
    setIsLocating(true)
    setLocationStatusText("Requesting browser permission...")

    try {
      const loc = await requestDeviceLocation()
      setIsChanging(false)
      setLocationStatusText(`Location detected: ${loc.label}`)
    } catch (err) {
      console.warn("Live location error:", err)
    } finally {
      setIsLocating(false)
    }
  }

  const handleManualSearch = () => {
    setIsChanging(true)
    setMode("search")
  }

  const handleLocationSelected = (loc: LocationData) => {
    setSearchLocation(loc)
    setIsChanging(false)
  }

  const handleChangeLocation = () => {
    setIsChanging(true)
    setMode("search")
  }

  const handleContinue = () => {
    setIsContinuing(true)
    setTimeout(() => {
      navigate("/app/patient")
    }, 400)
  }

  // Show resolved card only when a location exists and the user is NOT actively changing it
  const hasResolvedLocation = !isChanging && !!searchLocation

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[40%_60%] xl:grid-cols-[35%_65%]">
      {/* Desktop Visual Panel */}
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
          <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">
                Where should we look for healthcare?
              </h2>
              <p className="text-lg text-muted-foreground">
                Use your current location to discover healthcare nearby, or search for a place manually.
              </p>
            </div>

            {hasResolvedLocation ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                {/* Success State Card */}
                <div className="bg-primary/5 border-2 border-primary/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center text-primary shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      {searchLocation.source === "device" ? "Live Location Detected" : "Location Selected"}
                    </span>
                    <h3 className="text-2xl font-bold font-heading text-foreground">
                      {searchLocation.label || `${searchLocation.city}, ${searchLocation.region}`}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      Coordinates: {searchLocation.latitude.toFixed(4)}° N, {searchLocation.longitude.toFixed(4)}° E
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Button 
                    size="lg" 
                    className="w-full sm:flex-1 h-14 text-base font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
                    onClick={handleContinue}
                    disabled={isContinuing}
                  >
                    {isContinuing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isContinuing ? "Preparing your dashboard..." : "Continue"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 rounded-full font-medium"
                    onClick={handleChangeLocation}
                    disabled={isContinuing}
                  >
                    Change location
                  </Button>
                </div>
              </div>
            ) : mode === "initial" ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Permission feedback banner */}
                {permissionState === "denied" && (
                  <div className="flex items-start gap-3 bg-muted/60 p-4 rounded-2xl border border-border">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Permission was denied</p>
                      <p className="text-sm text-muted-foreground">You can search for your city or area manually below.</p>
                    </div>
                  </div>
                )}

                {/* Live Location Card */}
                <div className="bg-card border-2 border-border/80 hover:border-primary/50 transition-colors rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col items-center text-center space-y-5">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {isLocating ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Navigation className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-lg text-foreground">Use your current location</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {isLocating ? locationStatusText : "Medireach will ask your browser for permission to show healthcare options nearby."}
                    </p>
                  </div>

                  <Button 
                    className="w-full rounded-full h-13 text-base font-semibold shadow-sm"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Detecting location...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        Use current location
                      </span>
                    )}
                  </Button>
                </div>

                <div className="relative pt-2">
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
                  <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                  Search a location manually
                </Button>
              </div>
            ) : (
              /* Change / Search Location Screen - Contends both "Use current location" and "Search manually" */
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                
                {/* 1. Use Current Location Button on Change Screen */}
                <Button 
                  className="w-full rounded-2xl h-14 text-base font-semibold shadow-sm flex items-center justify-center gap-2.5"
                  onClick={handleUseLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Detecting current location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Use current location (GPS)
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-semibold">Or search manually</span>
                  </div>
                </div>

                {/* 2. Manual Search Input */}
                <div className="space-y-4">
                  <LocationSearch 
                    onSelect={handleLocationSelected} 
                    onUseCurrentLocation={handleUseLocation}
                    autoFocus 
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsChanging(false)
                      setMode("initial")
                    }}
                  >
                    ← Back to device location
                  </Button>
                  
                  {searchLocation && (
                    <Button 
                      variant="link" 
                      className="text-primary text-sm font-medium"
                      onClick={() => setIsChanging(false)}
                    >
                      Keep current ({searchLocation.city})
                    </Button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
