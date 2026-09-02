import React from "react"
import { Building, UserPlus, CheckCircle, XCircle, AlertCircle, RefreshCw, Calendar, Eye } from "lucide-react"
import type { AdminActivityLog } from "../../lib/admin/admin-types"
function formatDistanceToNow(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days`;
}

interface AdminActivityFeedProps {
  activities: AdminActivityLog[]
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "organization_submitted":
      return <Building className="w-4 h-4 text-primary" />
    case "organization_approved":
    case "organization_activated":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />
    case "organization_rejected":
      return <XCircle className="w-4 h-4 text-destructive" />
    case "organization_suspended":
      return <AlertCircle className="w-4 h-4 text-amber-500" />
    case "doctor_added":
    case "receptionist_added":
      return <UserPlus className="w-4 h-4 text-blue-500" />
    case "listing_updated":
      return <Eye className="w-4 h-4 text-purple-500" />
    case "appointment_created":
      return <Calendar className="w-4 h-4 text-muted-foreground" />
    default:
      return <RefreshCw className="w-4 h-4 text-muted-foreground" />
  }
}

export function AdminActivityFeed({ activities }: AdminActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-card border border-dashed rounded-3xl p-8 text-center">
        <p className="text-muted-foreground text-sm">No recent activity.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm">
      <h3 className="font-bold mb-6 flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-primary" /> Platform Activity
      </h3>
      <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[23px] before:w-px before:bg-border">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4 items-start group">
            <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center z-10 shrink-0 mt-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="pt-1.5 flex-1">
              <p className="text-sm font-medium">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.timestamp))} ago
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
