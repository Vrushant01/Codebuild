import React, { useState } from "react"
import { useLocationStore } from "../../lib/location/LocationContext"
import { MapPinOff, Navigation, AlertCircle, Loader2 } from "lucide-react"

export function LocationPermissionBanner() {
  const { permissionState, locationSource, requestDeviceLocation } = useLocationStore()
  const [loading, setLoading] = useState(false)

  if (permissionState === "granted" || locationSource === "device") return null

  const handleUseLocation = async () => {
    setLoading(true)
    try {
      await requestDeviceLocation()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 shadow-sm animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
          {permissionState === "denied" ? (
            <MapPinOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Navigation className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-foreground">
            {permissionState === "denied" ? "Location Access Denied" : "Find Nearby Hospitals"}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            {permissionState === "denied" 
              ? "You can still search for a city or area manually using the search bar." 
              : "Allow GPS location access to pinpoint your live location and find the closest healthcare facilities."}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleUseLocation}
              disabled={loading}
              className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              {loading ? "Locating..." : "Use my location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
