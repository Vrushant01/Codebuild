import React, { createContext, useContext, useState, useEffect } from "react"
import type { LocationData } from "./mock-locations"

export type PermissionState = "unknown" | "requesting" | "granted" | "denied" | "unavailable"

interface LocationContextType {
  deviceLocation: LocationData | null
  searchLocation: LocationData | null
  permissionState: PermissionState
  locationSource: "device" | "manual" | null
  requestDeviceLocation: () => Promise<void>
  setSearchLocation: (location: LocationData) => void
  clearLocation: () => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [deviceLocation, setDeviceLocation] = useState<LocationData | null>(null)
  const [searchLocation, setSearchLocationState] = useState<LocationData | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState>("unknown")
  const [locationSource, setLocationSource] = useState<"device" | "manual" | null>(null)

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("medireach_location")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSearchLocationState(parsed)
        setLocationSource(parsed.source)
        // We don't restore deviceLocation or permissionState automatically to respect browser state,
        // but searchLocation persists so they don't have to re-onboard.
      } catch (e) {
        console.error("Failed to parse saved location")
      }
    }
  }, [])

  const requestDeviceLocation = async () => {
    setPermissionState("requesting")

    if (!navigator.geolocation) {
      setPermissionState("unavailable")
      return
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success
          const newDeviceLoc: LocationData = {
            id: "loc_device",
            label: "Current location", // Safe generic label
            city: "Unknown", // Would need reverse geocoding
            region: "Unknown",
            country: "Unknown",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: "device"
          }
          setPermissionState("granted")
          setDeviceLocation(newDeviceLoc)
          setSearchLocationState(newDeviceLoc)
          setLocationSource("device")
          localStorage.setItem("medireach_location", JSON.stringify(newDeviceLoc))
          resolve()
        },
        (error) => {
          // Error/Denied
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionState("denied")
          } else {
            setPermissionState("unavailable") // Treat other errors as unavailable for now
          }
          resolve() // We resolve rather than reject so UI can handle it gracefully without crashing
        },
        { timeout: 10000 }
      )
    })
  }

  const setSearchLocation = (location: LocationData) => {
    const locWithSource = { ...location, source: "manual" as const }
    setSearchLocationState(locWithSource)
    setLocationSource("manual")
    localStorage.setItem("medireach_location", JSON.stringify(locWithSource))
  }

  const clearLocation = () => {
    setSearchLocationState(null)
    setLocationSource(null)
    localStorage.removeItem("medireach_location")
  }

  return (
    <LocationContext.Provider value={{
      deviceLocation,
      searchLocation,
      permissionState,
      locationSource,
      requestDeviceLocation,
      setSearchLocation,
      clearLocation
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationStore() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocationStore must be used within a LocationProvider")
  }
  return context
}
