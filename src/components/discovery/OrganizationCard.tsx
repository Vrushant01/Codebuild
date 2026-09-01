import React from "react"
import type { Organization } from "../../lib/healthcare/types"
import { Star, MapPin, Building2, Stethoscope, Video, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { AvailabilityBadge } from "../map/AvailabilityBadge"

interface OrganizationCardProps {
  organization: Organization
  isSelected?: boolean
  onClick?: () => void
  onActionClick?: () => void // Primary CTA like "View details"
}

export function OrganizationCard({ organization, isSelected, onClick, onActionClick }: OrganizationCardProps) {
  const isFull = organization.availability.status === "full"
  const isLimited = organization.availability.status === "limited"

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer group flex flex-col",
        isSelected 
          ? "border-primary ring-1 ring-primary/20 shadow-md" 
          : "hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <div className="p-4 sm:p-5 flex-1">
        
        {/* Header Row */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <div>
            <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
              {organization.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded-sm">
                {organization.type === "Hospital" ? <Building2 className="w-3 h-3" /> : <Stethoscope className="w-3 h-3" />}
                {organization.type}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {organization.distance} km
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-xs">{organization.rating}</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5">{organization.reviewCount} reviews</span>
          </div>
        </div>

        {/* Specializations / Chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {organization.specializations.slice(0, 3).map(spec => (
            <span key={spec} className="text-[10px] font-medium px-2 py-1 bg-primary/5 text-primary rounded-full border border-primary/10">
              {spec}
            </span>
          ))}
          {organization.specializations.length > 3 && (
            <span className="text-[10px] font-medium px-2 py-1 bg-muted text-muted-foreground rounded-full">
              +{organization.specializations.length - 3} more
            </span>
          )}
        </div>

        {/* Availability & Online Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
          <AvailabilityBadge 
            status={organization.availability.status} 
            showNextAvailable={organization.availability.status !== "full" ? organization.availability.nextAvailable : undefined} 
          />

          {organization.onlineConsultation && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-sm">
              <Video className="w-3 h-3" />
              Online available
            </div>
          )}
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex border-t divide-x">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onActionClick?.()
          }}
          className="flex-1 py-3 bg-card hover:bg-muted text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          View details
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            if (!isFull) {
              // Open booking flow or navigate
            }
          }}
          disabled={isFull}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1",
            isFull 
              ? "bg-muted/50 text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isFull ? "Fully booked" : "Book appointment"}
          {!isFull && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

    </div>
  )
}
