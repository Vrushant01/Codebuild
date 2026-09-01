import React from "react"
import { useLocationStore } from "../../lib/location/LocationContext"
import { MapPinOff, Navigation, AlertCircle } from "lucide-react"

export function LocationPermissionBanner() {
  const { permissionState, requestDeviceLocation } = useLocationStore()

  if (permissionState === "granted") return null

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center shrink-0">
          {permissionState === "denied" ? (
            <MapPinOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">
            {permissionState === "denied" ? "Location unavailable" : "Find nearby hospitals"}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            {permissionState === "denied" 
              ? "You can still search for a city or area manually." 
              : "Allow location access to see healthcare providers around you."}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={requestDeviceLocation}
              className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 flex items-center gap-1.5"
            >
              <Navigation className="w-3 h-3" />
              Use my location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
