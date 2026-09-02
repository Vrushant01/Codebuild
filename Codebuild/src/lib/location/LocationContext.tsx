import React, { createContext, useContext, useState, useEffect } from "react"
import type { LocationData } from "./mock-locations"
import { MOCK_LOCATIONS } from "./mock-locations"

export type PermissionState = "unknown" | "requesting" | "granted" | "denied" | "unavailable"

interface LocationContextType {
  deviceLocation: LocationData | null
  searchLocation: LocationData | null
  permissionState: PermissionState
  locationSource: "device" | "manual" | null
  requestDeviceLocation: () => Promise<LocationData>
  setSearchLocation: (location: LocationData) => void
  clearLocation: () => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string; region: string; label: string }> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { "Accept-Language": "en" }
      }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}
      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || ""
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "Surat"
      const region = addr.state || "Gujarat"

      const label = locality ? `${locality}, ${city}` : `${city}, ${region}`
      return { city, region, label }
    }
  } catch (err) {
    console.warn("Reverse geocode failed or timed out, using proximity fallback:", err)
  }

  // Find closest known city from mock locations
  const knownCities = [
    { city: "Surat", region: "Gujarat", label: "Surat, Gujarat", latitude: 21.1702, longitude: 72.8311 },
    { city: "Ahmedabad", region: "Gujarat", label: "Ahmedabad, Gujarat", latitude: 23.0225, longitude: 72.5714 },
    { city: "Vadodara", region: "Gujarat", label: "Vadodara, Gujarat", latitude: 22.3072, longitude: 73.1812 },
    { city: "Rajkot", region: "Gujarat", label: "Rajkot, Gujarat", latitude: 22.3039, longitude: 70.8022 },
  ]

  let closest = knownCities[0]
  let minDistance = Number.MAX_VALUE

  for (const loc of knownCities) {
    const d = Math.hypot(loc.latitude - lat, loc.longitude - lng)
    if (d < minDistance) {
      minDistance = d
      closest = loc
    }
  }

  return {
    city: closest.city,
    region: closest.region,
    label: closest.label
  }
}

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
      } catch (e) {
        console.error("Failed to parse saved location")
      }
    }
  }, [])

  const requestDeviceLocation = async (): Promise<LocationData> => {
    setPermissionState("requesting")

    // 1. Try Browser Geolocation API first (Fresh high-accuracy read)
    if (typeof window !== "undefined" && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
          })
        })

        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const geoInfo = await reverseGeocode(lat, lng)

        const newDeviceLoc: LocationData = {
          id: `loc_live_${Date.now()}`,
          label: geoInfo.label,
          city: geoInfo.city,
          region: geoInfo.region,
          country: "India",
          latitude: lat,
          longitude: lng,
          source: "device"
        }

        setPermissionState("granted")
        setDeviceLocation(newDeviceLoc)
        setSearchLocationState(newDeviceLoc)
        setLocationSource("device")
        localStorage.setItem("medireach_location", JSON.stringify(newDeviceLoc))
        return newDeviceLoc
      } catch (geoError: any) {
        console.warn("Browser GPS error or timeout:", geoError?.message)
        if (geoError?.code === 1) {
          setPermissionState("denied")
        } else {
          setPermissionState("unavailable")
        }
      }
    } else {
      setPermissionState("unavailable")
    }

    // 2. Fallback: Live IP-based location
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      const ipRes = await fetch("https://ipwho.is/", { signal: controller.signal })
      clearTimeout(timeoutId)

      if (ipRes.ok) {
        const ipData = await ipRes.json()
        if (ipData.success && ipData.latitude && ipData.longitude) {
          const ipLoc: LocationData = {
            id: `loc_ip_${Date.now()}`,
            label: `${ipData.city || "Surat"}, ${ipData.region || "Gujarat"}`,
            city: ipData.city || "Surat",
            region: ipData.region || "Gujarat",
            country: ipData.country || "India",
            latitude: ipData.latitude,
            longitude: ipData.longitude,
            source: "device"
          }

          setPermissionState("granted")
          setDeviceLocation(ipLoc)
          setSearchLocationState(ipLoc)
          setLocationSource("device")
          localStorage.setItem("medireach_location", JSON.stringify(ipLoc))
          return ipLoc
        }
      }
    } catch (ipErr) {
      console.warn("IP Geolocation fallback failed:", ipErr)
    }

    // 3. Guaranteed Safe Default (Surat Hub)
    const fallbackLoc: LocationData = {
      id: "loc_surat_default",
      label: "Surat, Gujarat",
      city: "Surat",
      region: "Gujarat",
      country: "India",
      latitude: 21.1702,
      longitude: 72.8311,
      source: "device"
    }

    setPermissionState("granted")
    setDeviceLocation(fallbackLoc)
    setSearchLocationState(fallbackLoc)
    setLocationSource("device")
    localStorage.setItem("medireach_location", JSON.stringify(fallbackLoc))
    return fallbackLoc
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
