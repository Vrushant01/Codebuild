import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import type { Organization } from "../../lib/healthcare/types"
import { Building2, Stethoscope, Star } from "lucide-react"
import { renderToString } from "react-dom/server"

interface HealthcareMapProps {
  organizations: Organization[]
  selectedOrgId: string | null
  onOrgSelect: (id: string) => void
  centerCity: string
}

const cityCenters: Record<string, [number, number]> = {
  "Ahmedabad": [23.0225, 72.5714],
  "Surat": [21.1702, 72.8311],
  "Rajkot": [22.3039, 70.8022],
  "Vadodara": [22.3072, 73.1812],
}

// Center Map Component to programmatically change view
function MapViewUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

const createCustomIcon = (org: Organization, isSelected: boolean) => {
  const isFull = org.availability.status === "full"
  const isLimited = org.availability.status === "limited"
  
  let bgColorClass = "bg-background border-primary text-primary"
  if (isSelected) {
    bgColorClass = "bg-primary border-primary text-primary-foreground"
  } else if (isFull) {
    bgColorClass = "bg-muted border-border text-muted-foreground"
  } else if (isLimited) {
    bgColorClass = "bg-amber-100 border-amber-500 text-amber-700"
  }

  const iconSvg = org.type === "Hospital" 
    ? renderToString(<Building2 className="w-4 h-4" />) 
    : renderToString(<Stethoscope className="w-4 h-4" />)

  const html = `
    <div class="relative flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}">
      <div class="mb-1 px-2.5 py-1 rounded-md text-xs font-semibold shadow-md border whitespace-nowrap transition-all duration-200 ${isSelected ? 'bg-primary text-primary-foreground border-primary opacity-100' : 'bg-background text-foreground border-border'}">
        ${org.name}
      </div>
      <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 ${bgColorClass}">
        ${iconSvg}
      </div>
      <div class="w-2 h-2 rounded-sm rotate-45 -mt-1 border-r-2 border-b-2 shadow-sm ${bgColorClass.split(' ').slice(0, 2).join(' ')}" />
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

export function HealthcareMap({ organizations, selectedOrgId, onOrgSelect, centerCity }: HealthcareMapProps) {
  const center = cityCenters[centerCity] || cityCenters["Ahmedabad"]

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <MapViewUpdater center={center} zoom={13} />
        
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
      </MapContainer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background-color: var(--muted) !important;
        }
        .dark .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .custom-leaflet-icon {
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
