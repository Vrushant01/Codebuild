import React, { useRef, useState, useEffect } from "react"
import type { Organization } from "../../lib/healthcare/types"
import { MapPin, Navigation, Building2, Stethoscope } from "lucide-react"
import { cn } from "../../lib/utils"

interface InteractiveMockMapProps {
  organizations: Organization[]
  selectedOrgId: string | null
  onOrgSelect: (id: string) => void
  centerCity: string
}

// A stylised mock map experience that satisfies the frontend requirement without real map tiles.
export function InteractiveMockMap({ organizations, selectedOrgId, onOrgSelect, centerCity }: InteractiveMockMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Reset map view when city changes
  useEffect(() => {
    setPan({ x: 0, y: 0 })
    setScale(1)
  }, [centerCity])

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow drag on the map background itself, not the markers
    if ((e.target as HTMLElement).closest('button')) return
    
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    if (mapRef.current) {
      mapRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    if (mapRef.current) {
      mapRef.current.releasePointerCapture(e.pointerId)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default scroll if hovering map to zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const zoomSensitivity = 0.005
      setScale(s => Math.min(Math.max(0.5, s - e.deltaY * zoomSensitivity), 3))
    }
  }

  // Calculate relative marker positions for the mock
  // We'll normalize coordinates around the center city's rough coords
  const cityCenters: Record<string, { lat: number, lon: number }> = {
    "Ahmedabad": { lat: 23.0225, lon: 72.5714 },
    "Surat": { lat: 21.1702, lon: 72.8311 },
  }
  const center = cityCenters[centerCity] || cityCenters["Ahmedabad"]

  const getMarkerStyle = (lat: number, lon: number) => {
    // Scale factor to spread points out visually
    const spread = 8000
    const x = (lon - center.lon) * spread
    const y = -(lat - center.lat) * spread // Invert Y since screen coordinates go down

    return {
      transform: `translate(calc(50vw + ${x}px), calc(50vh + ${y}px))`
    }
  }

  return (
    <div 
      className="relative w-full h-full bg-[#eef1f5] dark:bg-[#1a1f2c] overflow-hidden cursor-grab active:cursor-grabbing select-none"
      ref={mapRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }} // Crucial for mobile drag
    >
      
      {/* Mock Map Grid / Roads Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          backgroundImage: `
            linear-gradient(to right, #94a3b8 1px, transparent 1px),
            linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* City Label */}
      <div 
        className="absolute pointer-events-none transition-transform duration-75 flex items-center justify-center opacity-30 dark:opacity-20"
        style={{
          transform: `translate(calc(50vw + ${pan.x}px), calc(50vh + ${pan.y}px)) scale(${scale})`,
        }}
      >
        <span className="text-6xl font-bold uppercase tracking-[1em] text-slate-400 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          {centerCity}
        </span>
      </div>

      {/* Markers Layer */}
      <div 
        className="absolute inset-0 transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        
        {/* Device Location Marker (Mocked slightly offset from center) */}
        <div 
          className="absolute flex items-center justify-center pointer-events-none"
          style={{ transform: `translate(calc(50vw - 20px), calc(50vh + 30px))` }}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md z-10 animate-pulse" />
          <div className="w-12 h-12 bg-blue-500/20 rounded-full absolute animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        {/* Organization Markers */}
        {organizations.map(org => {
          const isSelected = org.id === selectedOrgId
          const isFull = org.availability.status === "full"
          const isLimited = org.availability.status === "limited"
          
          return (
            <button
              key={org.id}
              onClick={(e) => {
                e.stopPropagation()
                onOrgSelect(org.id)
              }}
              className={cn(
                "absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-full transition-all duration-300 outline-none z-20 group",
                isSelected ? "z-30 scale-110" : "hover:scale-105 hover:z-30"
              )}
              style={getMarkerStyle(org.latitude, org.longitude)}
            >
              
              {/* Tooltip / Label */}
              <div className={cn(
                "mb-1 px-2.5 py-1 rounded-md text-xs font-semibold shadow-md border whitespace-nowrap transition-all duration-200",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary opacity-100 translate-y-0" 
                  : "bg-background text-foreground border-border opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
                isFull && !isSelected && "group-hover:bg-muted group-hover:text-muted-foreground"
              )}>
                {org.name}
              </div>

              {/* Pin */}
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors",
                isSelected 
                  ? "bg-primary border-primary text-primary-foreground"
                  : isFull
                    ? "bg-muted border-border text-muted-foreground"
                    : isLimited
                      ? "bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/50 dark:border-amber-500 dark:text-amber-400"
                      : "bg-background border-primary text-primary"
              )}>
                {org.type === "Hospital" ? <Building2 className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
              </div>
              
              {/* Map pin tail */}
              <div className={cn(
                "w-2 h-2 rounded-sm rotate-45 -mt-1 border-r-2 border-b-2 shadow-sm transition-colors",
                isSelected 
                  ? "bg-primary border-primary" 
                  : isFull 
                    ? "bg-muted border-border" 
                    : isLimited
                      ? "bg-amber-100 border-amber-500 dark:bg-amber-900/50"
                      : "bg-background border-primary"
              )} />
              
            </button>
          )
        })}

      </div>

      {/* Map Controls */}
      <div className="absolute right-4 bottom-24 lg:bottom-8 flex flex-col gap-2 z-40">
        <button 
          onClick={() => { setScale(1); setPan({x:0, y:0}) }}
          className="w-10 h-10 bg-background/90 backdrop-blur border rounded-full flex items-center justify-center text-foreground shadow-sm hover:bg-muted transition-colors"
          title="Recenter Map"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}
