import React, { useState } from "react"
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  Star, 
  Building2, 
  Video, 
  Calendar, 
  RotateCcw,
  Stethoscope
} from "lucide-react"
import type { HealthcareFilterState, OrganizationType } from "../../lib/healthcare/types"
import { Button } from "../ui/button"

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
  "Gynecologist",
  "Neurologist",
  "Oncologist",
  "Critical Care"
]

const FACILITY_TYPES: OrganizationType[] = [
  "Hospital",
  "Clinic",
  "Specialty Clinic",
  "Diagnostic"
]

export function HealthcareFilters({ filters, onFilterChange }: HealthcareFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Count active non-default filters
  const activeFilterCount = 
    (filters.organizationType?.length || 0) +
    (filters.specializations?.length || 0) +
    (filters.consultationType !== "All" ? 1 : 0) +
    (filters.availability !== "All" ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0)

  const toggleSpecialization = (spec: string) => {
    const isSelected = filters.specializations.includes(spec)
    let newSpecs: string[]
    if (isSelected) {
      newSpecs = filters.specializations.filter(s => s !== spec)
    } else {
      newSpecs = [...filters.specializations, spec]
    }
    onFilterChange({ ...filters, specializations: newSpecs })
  }

  const toggleFacilityType = (type: OrganizationType) => {
    const current = filters.organizationType || []
    const isSelected = current.includes(type)
    const next: OrganizationType[] = isSelected ? current.filter(t => t !== type) : [...current, type]
    onFilterChange({ ...filters, organizationType: next })
  }

  const handleClearAll = () => {
    onFilterChange({
      searchQuery: "",
      organizationType: [],
      specializations: [],
      consultationType: "All",
      availability: "All",
      minRating: 0
    })
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      
      {/* Search Bar with Clear Icon */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search healthcare, doctors, places, or specializations..."
          className="w-full pl-10 pr-10 py-2.5 bg-background border border-border/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Action Bar & Horizontal Specialty Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        
        {/* Advanced Filter Modal Trigger */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
            activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-primary-foreground text-primary rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
              {activeFilterCount}
            </span>
          )}
        </button>
        
        {/* Quick Availability Dropdown */}
        <select
          value={filters.availability}
          onChange={(e) => onFilterChange({ ...filters, availability: e.target.value as any })}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none pr-8 cursor-pointer relative ${
            filters.availability !== "All"
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '10px' }}
        >
          <option value="All">All Availability</option>
          <option value="Available">Available Today</option>
          <option value="Limited">Limited slots</option>
          <option value="Fully booked">Fully booked</option>
        </select>

        {/* Quick Specialization Pills */}
        {COMMON_SPECIALIZATIONS.map(spec => {
          const isSelected = filters.specializations.includes(spec)
          return (
            <button
              key={spec}
              type="button"
              onClick={() => toggleSpecialization(spec)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {spec}
            </button>
          )
        })}

        {/* Clear All Button if active */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Advanced Filters Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border rounded-[2rem] p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Healthcare Filters</h3>
                  <p className="text-xs text-muted-foreground">Customize discovery parameters</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Section 1: Facility Type */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Facility Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FACILITY_TYPES.map(type => {
                  const isChecked = (filters.organizationType || []).includes(type)
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFacilityType(type)}
                      className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                        isChecked 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-muted/30 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{type}</span>
                      {isChecked && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section 2: Consultation Mode */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-primary" /> Consultation Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["All", "Physical", "Online"] as const).map(mode => {
                  const isSelected = filters.consultationType === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onFilterChange({ ...filters, consultationType: mode })}
                      className={`p-2.5 rounded-2xl text-xs font-bold border transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-muted/30 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {mode === "All" ? "All Modes" : mode === "Online" ? "Online Video" : "In-Person"}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section 3: Availability */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Doctor Availability
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "All", label: "Any Time" },
                  { id: "Available", label: "Available Today" },
                  { id: "Limited", label: "Limited Slots" },
                  { id: "Fully booked", label: "Fully Booked" }
                ].map(opt => {
                  const isSelected = filters.availability === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onFilterChange({ ...filters, availability: opt.id as any })}
                      className={`p-2.5 rounded-2xl text-xs font-bold border transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-muted/30 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section 4: Minimum Rating */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Minimum Patient Rating
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { rating: 0, label: "All" },
                  { rating: 3.5, label: "3.5+ ★" },
                  { rating: 4.0, label: "4.0+ ★" },
                  { rating: 4.5, label: "4.5+ ★" }
                ].map(item => {
                  const isSelected = filters.minRating === item.rating
                  return (
                    <button
                      key={item.rating}
                      type="button"
                      onClick={() => onFilterChange({ ...filters, minRating: item.rating })}
                      className={`p-2 rounded-2xl text-xs font-bold border transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-muted/30 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section 5: Medical Specializations */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-primary" /> Medical Specializations
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-muted/20 rounded-2xl border">
                {COMMON_SPECIALIZATIONS.map(spec => {
                  const isSelected = filters.specializations.includes(spec)
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
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

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-muted-foreground hover:text-destructive flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All
              </button>
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow-md"
              >
                Apply Filters
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
