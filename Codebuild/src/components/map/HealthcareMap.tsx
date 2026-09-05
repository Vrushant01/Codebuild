import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import type { Organization } from "../../lib/healthcare/types"
import { Building2, Stethoscope, Star, Navigation, MapPin, LocateFixed } from "lucide-react"
import { renderToString } from "react-dom/server"

interface HealthcareMapProps {
  organizations: Organization[]
  selectedOrgId: string | null
  onOrgSelect: (id: string) => void
  centerCity: string
  userLocation?: { latitude: number; longitude: number; label?: string } | null
  onRequestLocation?: () => void
}

const cityCenters: Record<string, [number, number]> = {
  "Surat": [21.1702, 72.8311],
  "Ahmedabad": [23.0225, 72.5714],
  "Vadodara": [22.3072, 73.1812],
  "Rajkot": [22.3039, 70.8022],
  "Gandhinagar": [23.2156, 72.6369],
  "Bhavnagar": [21.7645, 72.1519],
  "Jamnagar": [22.4707, 70.0577],
  "Junagadh": [21.5222, 70.4579],
  "Anand": [22.5645, 72.9289],
  "Navsari": [20.9500, 72.9300],
  "Bharuch": [21.7051, 72.9959],
  "Valsad": [20.5992, 72.9342],
  "Mehsana": [23.5880, 72.3693],
  "Bhuj": [23.2420, 69.6669],
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.6139, 77.2090],
  "New Delhi": [28.6139, 77.2090],
  "Pune": [18.5204, 73.8567],
  "Bengaluru": [12.9716, 77.5946],
  "Hyderabad": [17.3850, 78.4867],
  "Jaipur": [26.9124, 75.7873]
}

// Center Map Component to programmatically change view
function MapViewUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

// Locate Me Button Control inside Map
function LocateMeControl({ userLocation, onRequestLocation }: { 
  userLocation?: { latitude: number; longitude: number } | null
  onRequestLocation?: () => void
}) {
  const map = useMap()

  const handleCenter = () => {
    if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 14, { animate: true, duration: 1.2 })
    } else if (onRequestLocation) {
      onRequestLocation()
    }
  }

  return (
    <div className="leaflet-bottom leaflet-right !mb-6 !mr-6 z-[1000] pointer-events-auto">
      <button
        type="button"
        onClick={handleCenter}
        className="bg-background text-foreground hover:bg-muted border border-border/80 shadow-xl rounded-2xl p-3 flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 active:scale-95 group"
        title="Center on my location"
      >
        <LocateFixed className="w-4 h-4 text-primary group-hover:rotate-45 transition-transform" />
        <span className="hidden sm:inline">My Location</span>
      </button>
    </div>
  )
}

const createCustomIcon = (org: Organization, isSelected: boolean) => {
  const isFull = org.availability.status === "full"
  const isLimited = org.availability.status === "limited"
  
  let bgColorClass = "bg-white border-primary text-primary shadow-md"
  if (isSelected) {
    bgColorClass = "bg-primary border-white text-white shadow-xl"
  } else if (isFull) {
    bgColorClass = "bg-white border-slate-300 text-slate-500 shadow-sm"
  } else if (isLimited) {
    bgColorClass = "bg-white border-amber-400 text-amber-600 shadow-md"
  }

  const iconSvg = org.type === "Hospital" 
    ? renderToString(<Building2 className="w-4 h-4" />) 
    : renderToString(<Stethoscope className="w-4 h-4" />)

  const html = `
    <div class="relative flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}">
      <div class="mb-1 px-3 py-1 rounded-full text-xs font-bold shadow-md border whitespace-nowrap transition-all duration-200 ${isSelected ? 'bg-primary text-white border-primary opacity-100' : 'bg-white text-slate-800 border-slate-200 shadow-sm'}">
        ${org.name}
      </div>
      <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${bgColorClass}">
        ${iconSvg}
      </div>
      <div class="w-2.5 h-2.5 rounded-xs rotate-45 -mt-1 border-r-2 border-b-2 shadow-sm ${bgColorClass.split(' ').slice(0, 2).join(' ')}" />
    </div>
  `

  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    popupAnchor: [0, -60]
  })
}

const createUserLocationIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-9 h-9 rounded-full bg-blue-500/30 animate-ping"></div>
      <div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-blue-500/20">
        <div class="w-2.5 h-2.5 rounded-full bg-white shadow-sm"></div>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: "custom-user-location-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  })
}

export function HealthcareMap({ 
  organizations, 
  selectedOrgId, 
  onOrgSelect, 
  centerCity,
  userLocation,
  onRequestLocation 
}: HealthcareMapProps) {
  // Use user location if available, otherwise city center
  const center: [number, number] = userLocation?.latitude && userLocation?.longitude
    ? [userLocation.latitude, userLocation.longitude]
    : (cityCenters[centerCity] || cityCenters["Ahmedabad"])

  const [mapCenter, setMapCenter] = useState<[number, number]>(center)

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setMapCenter([userLocation.latitude, userLocation.longitude])
    } else {
      setMapCenter(cityCenters[centerCity] || cityCenters["Ahmedabad"])
    }
  }, [userLocation, centerCity])

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={userLocation ? 14 : 13} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <MapViewUpdater center={mapCenter} zoom={userLocation ? 14 : 13} />
        
        {/* User's Live Location Marker */}
        {userLocation?.latitude && userLocation?.longitude && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserLocationIcon()}
            zIndexOffset={1000}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs mb-0.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>You are here</span>
                </div>
                <p className="text-xs font-medium text-foreground">
                  {userLocation.label || "Current GPS Location"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Healthcare Organizations */}
        {organizations.map(org => (
          <Marker 
            key={org.id}
            position={[org.latitude, org.longitude]}
            icon={createCustomIcon(org, org.id === selectedOrgId)}
            eventHandlers={{
              click: () => onOrgSelect(org.id),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1">{org.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{org.rating} ({org.reviewCount} reviews)</span>
                </div>
                <div className="text-xs capitalize font-medium text-primary">
                  {org.availability.status.replace("-", " ")}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Center on My Location Quick Button */}
        <LocateMeControl userLocation={userLocation} onRequestLocation={onRequestLocation} />
      </MapContainer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background-color: var(--muted) !important;
        }
        .dark .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .custom-leaflet-icon, .custom-user-location-icon {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
      `}} />
    </div>
  )
}
