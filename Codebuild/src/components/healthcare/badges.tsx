import React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertCircle, MapPin, Video, Building, User, Activity } from "lucide-react"

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
export type OrgStatus = "PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED"

interface StatusBadgeProps {
  status: AppointmentStatus | OrgStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();
  
  switch (normalizedStatus) {
    case "CONFIRMED":
    case "COMPLETED":
    case "APPROVED":
    case "ACTIVE":
      return (
        <Badge variant="outline" className="bg-success/10 text-success hover:bg-success/20 border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/20">
          <Clock className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    case "CANCELLED":
    case "NO_SHOW":
    case "SUSPENDED":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
          <XCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-info/10 text-info hover:bg-info/20 border-info/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
  }
}

export function SymptomChip({ symptom }: { symptom: string }) {
  return (
    <Badge variant="secondary" className="rounded-full font-normal">
      <Activity className="w-3 h-3 mr-1 text-primary" />
      {symptom}
    </Badge>
  );
}

export function SpecializationChip({ spec }: { spec: string }) {
  return (
    <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
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
    <Badge variant="secondary" className={`gap-1 ${isVideo ? "text-blue-600 bg-blue-50" : "text-emerald-600 bg-emerald-50"}`}>
      {isVideo ? <Video className="w-3 h-3" /> : <Building className="w-3 h-3" />}
      {isVideo ? "Video Consult" : "In-Person"}
    </Badge>
  );
}
