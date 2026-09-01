import React, { useState, useEffect, useRef } from "react"
import { Search, MapPin, X, Loader2 } from "lucide-react"
import { Input } from "../ui/input"
import { MOCK_LOCATIONS } from "../../lib/location/mock-locations"
import type { LocationData } from "../../lib/location/mock-locations"
import { cn } from "../../lib/utils"

interface LocationSearchProps {
  onSelect: (location: LocationData) => void
  autoFocus?: boolean
}

export function LocationSearch({ onSelect, autoFocus = false }: LocationSearchProps) {
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

  // Mock search logic
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
        loc.label.toLowerCase().includes(lowerQuery)
      )
      setResults(matches)
      setIsSearching(false)
    }, 400) // Mock network delay

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
        <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search city, area or location..."
          className="pl-10 pr-10 h-14 text-base rounded-xl border-2 focus-visible:ring-primary shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-expanded={showDropdown}
          aria-controls="location-results"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 p-1 rounded-full text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div 
          id="location-results"
          className="absolute top-full mt-2 w-full bg-card border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {isSearching ? (
            <div className="p-6 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">Searching locations...</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-[300px] overflow-y-auto py-2">
              {results.map((loc) => (
                <li key={loc.id}>
                  <button
                    onClick={() => handleSelect(loc)}
                    className="w-full text-left px-4 py-3 hover:bg-muted focus:bg-muted focus:outline-none flex items-start gap-3 transition-colors"
                  >
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full text-primary shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">{loc.city}</p>
                      <p className="text-sm text-muted-foreground">{loc.region}, {loc.country}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="font-medium">No locations found</p>
              <p className="text-sm text-muted-foreground mt-1">Try searching for a major city like Ahmedabad or Surat.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
