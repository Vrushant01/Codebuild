import React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertCircle, MapPin, Video, Building, User, Activity } from "lucide-react"

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
export type OrgStatus = "PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED"

interface StatusBadgeProps {
  status: AppointmentStatus | OrgStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = (status || "").toUpperCase();
  
  switch (normalizedStatus) {
    case "CONFIRMED":
    case "COMPLETED":
    case "APPROVED":
    case "ACTIVE":
      return (
        <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 shadow-xs font-bold text-[11px] gap-1 px-2.5 py-0.5 rounded-full">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {status}
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-white text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 shadow-xs font-bold text-[11px] gap-1 px-2.5 py-0.5 rounded-full">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          {status}
        </Badge>
      );
    case "CANCELLED":
    case "NO_SHOW":
    case "SUSPENDED":
    case "REJECTED":
      return (
        <Badge variant="outline" className="bg-white text-destructive border-destructive/30 dark:bg-destructive/15 dark:text-red-300 dark:border-destructive/40 shadow-xs font-bold text-[11px] gap-1 px-2.5 py-0.5 rounded-full">
          <XCircle className="w-3.5 h-3.5 text-destructive" />
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-white text-primary border-primary/30 dark:bg-primary/15 dark:text-primary dark:border-primary/40 shadow-xs font-bold text-[11px] gap-1 px-2.5 py-0.5 rounded-full">
          <AlertCircle className="w-3.5 h-3.5 text-primary" />
          {status}
        </Badge>
      );
  }
}

export function SymptomChip({ symptom }: { symptom: string }) {
  return (
    <Badge variant="secondary" className="rounded-full font-medium bg-muted/60 text-foreground border border-border/50">
      <Activity className="w-3 h-3 mr-1 text-primary" />
      {symptom}
    </Badge>
  );
}

export function SpecializationChip({ spec }: { spec: string }) {
  return (
    <Badge variant="outline" className="text-primary border-primary/30 bg-white dark:bg-primary/10 shadow-xs font-semibold">
      {spec}
    </Badge>
  );
}

export function LocationBadge({ location, distance }: { location: string; distance?: string }) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <MapPin className="w-4 h-4 mr-1 text-primary/70" />
      <span>{location}</span>
      {distance && (
        <>
          <span className="mx-1">•</span>
          <span className="font-medium text-foreground">{distance}</span>
        </>
      )}
    </div>
  );
}

export function ConsultationTypeBadge({ type }: { type: "TELEMEDICINE" | "IN_PERSON" }) {
  const isVideo = type === "TELEMEDICINE";
  return (
    <Badge variant="outline" className={`gap-1 font-bold ${isVideo ? "text-blue-700 bg-white border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700" : "text-emerald-700 bg-white border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"} shadow-xs`}>
      {isVideo ? <Video className="w-3 h-3 text-blue-600" /> : <Building className="w-3 h-3 text-emerald-600" />}
      {isVideo ? "Video Consult" : "In-Person"}
    </Badge>
  );
}
