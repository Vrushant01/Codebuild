import React from "react"
import type { Doctor } from "../../lib/healthcare/types"
import { Star, Video, Stethoscope, ChevronRight, User } from "lucide-react"
import { cn } from "../../lib/utils"

interface DoctorCardProps {
  doctor: Doctor
  onActionClick?: () => void
}

export function DoctorCard({ doctor, onActionClick }: DoctorCardProps) {
  const isFull = doctor.availability.status === "full"
  const hasOnline = doctor.consultationTypes.includes("Online")

  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 flex flex-col gap-4 hover:border-primary/50 hover:shadow-sm transition-all duration-200">
      
      {/* Top Row: Profile & Info */}
      <div className="flex gap-4">
        {/* Avatar Mock */}
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <User className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="font-semibold text-foreground truncate">{doctor.name}</h4>
              <p className="text-sm text-primary font-medium flex items-center gap-1.5 mt-0.5 truncate">
                <Stethoscope className="w-3.5 h-3.5" />
                {doctor.specialization}
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-bold text-xs">{doctor.rating}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{doctor.reviewCount} revs</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 line-clamp-1">
            {doctor.experience} yrs experience &bull; {doctor.qualifications.join(", ")}
          </div>
        </div>
      </div>

      {/* Badges / Availability */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={cn(
          "px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs flex items-center gap-1.5",
          isFull 
            ? "bg-white text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700" 
            : "bg-white text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full", isFull ? "bg-slate-400" : "bg-emerald-500 animate-pulse")} />
          {isFull ? "Fully booked" : `Available ${doctor.availability.nextAvailable}`}
        </div>

        {hasOnline && (
          <div className="px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs bg-white text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700 flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Video consultation
          </div>
        )}
      </div>

      {/* Action */}
      <button 
        onClick={onActionClick}
        className={cn(
          "w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
          isFull 
            ? "bg-muted text-muted-foreground cursor-not-allowed" 
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        )}
        disabled={isFull}
      >
        {isFull ? "No slots available" : "View available slots"}
        {!isFull && <ChevronRight className="w-4 h-4" />}
      </button>

    </div>
  )
}
