import React, { useState, useEffect, useRef } from "react"
import { Search, MapPin, X, Loader2, Navigation } from "lucide-react"
import { Input } from "../ui/input"
import { MOCK_LOCATIONS } from "../../lib/location/mock-locations"
import type { LocationData } from "../../lib/location/mock-locations"
import { cn } from "../../lib/utils"

interface LocationSearchProps {
  onSelect: (location: LocationData) => void
  onUseCurrentLocation?: () => void
  autoFocus?: boolean
}

export function LocationSearch({ onSelect, onUseCurrentLocation, autoFocus = false }: LocationSearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Omit<LocationData, "source">[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Search logic
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    setShowDropdown(true)

    const timer = setTimeout(() => {
      const lowerQuery = query.toLowerCase()
      const matches = MOCK_LOCATIONS.filter(loc => 
        loc.city.toLowerCase().includes(lowerQuery) || 
        loc.label.toLowerCase().includes(lowerQuery) ||
        loc.region.toLowerCase().includes(lowerQuery)
      )
      setResults(matches)
      setIsSearching(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (loc: Omit<LocationData, "source">) => {
    setQuery(loc.city)
    setShowDropdown(false)
    onSelect({ ...loc, source: "manual" })
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowDropdown(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search city, area or landmark..."
          className="pl-11 pr-10 h-14 text-base rounded-2xl border-2 focus-visible:ring-primary shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setShowDropdown(true)
          }}
          aria-expanded={showDropdown}
          aria-controls="location-results"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 p-1.5 rounded-full text-muted-foreground hover:bg-muted focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div 
          id="location-results"
          className="absolute top-full mt-2 w-full bg-card border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {onUseCurrentLocation && (
            <div className="p-2 border-b bg-muted/30">
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false)
                  onUseCurrentLocation()
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:outline-none flex items-center gap-3 transition-colors text-sm font-semibold"
              >
                <div className="bg-primary/15 p-2 rounded-full text-primary shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <span>Use current location (GPS)</span>
              </button>
            </div>
          )}

          {isSearching ? (
            <div className="p-6 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
              <p className="text-sm">Searching locations...</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-[280px] overflow-y-auto py-1.5">
              {results.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className="w-full text-left px-4 py-3 hover:bg-muted focus:bg-muted focus:outline-none flex items-start gap-3 transition-colors"
                  >
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full text-primary shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{loc.city}</p>
                      <p className="text-xs text-muted-foreground">{loc.region}, {loc.country}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="font-medium text-foreground">No locations found for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching for Ahmedabad, Surat, Vadodara, or Rajkot.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
