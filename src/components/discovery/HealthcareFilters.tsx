import React from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import type { HealthcareFilterState } from "../../lib/healthcare/types"

interface HealthcareFiltersProps {
  filters: HealthcareFilterState
  onFilterChange: (filters: HealthcareFilterState) => void
}

const COMMON_SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Gynecologist"
]

export function HealthcareFilters({ filters, onFilterChange }: HealthcareFiltersProps) {
  
  const toggleSpecialization = (spec: string) => {
    const isSelected = filters.specializations.includes(spec)
    let newSpecs
    if (isSelected) {
      newSpecs = filters.specializations.filter(s => s !== spec)
    } else {
      newSpecs = [...filters.specializations, spec]
    }
    onFilterChange({ ...filters, specializations: newSpecs })
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search healthcare, doctors or places..."
          className="w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* Quick Specialization Chips - Scrollable horizontally */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-semibold uppercase tracking-wider">
          <SlidersHorizontal className="w-3 h-3" /> Filters
        </div>
        
        {/* Availability Filter */}
        <select
          value={filters.availability}
          onChange={(e) => onFilterChange({ ...filters, availability: e.target.value as any })}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border bg-background text-foreground border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none pr-8 cursor-pointer relative"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '10px' }}
        >
          <option value="All">All Availability</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited slots</option>
          <option value="Fully booked">Fully booked</option>
        </select>

        {COMMON_SPECIALIZATIONS.map(spec => {
          const isSelected = filters.specializations.includes(spec)
          return (
            <button
              key={spec}
              onClick={() => toggleSpecialization(spec)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {spec}
            </button>
          )
        })}
      </div>

    </div>
  )
}
