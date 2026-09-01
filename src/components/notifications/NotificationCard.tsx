import React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import type { AppNotification } from "../../lib/notifications/notification-types"
import { getNotificationIcon, getNotificationTarget, formatRelativeTime } from "../../lib/notifications/notification-utils"
import { useAuth } from "../../lib/auth/AuthContext"
import { useNotifications } from "../../lib/notifications/NotificationContext"

interface NotificationCardProps {
  notification: AppNotification
  onClose?: () => void
  isDropdown?: boolean
}

export function NotificationCard({ notification, onClose, isDropdown = false }: NotificationCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { markAsRead } = useNotifications()
  const Icon = getNotificationIcon(notification.type)
  const targetRoute = getNotificationTarget(notification, user?.role)

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    if (targetRoute) {
      navigate(targetRoute)
      onClose?.()
    }
  }

  return (
    <div 
      className={cn(
        "group relative flex items-start gap-4 p-4 transition-colors cursor-pointer",
        isDropdown ? "border-b last:border-b-0 hover:bg-muted/50" : "rounded-2xl border",
        notification.read 
          ? "bg-background border-transparent" 
          : "bg-primary/5 hover:bg-primary/10 border-primary/20",
        !isDropdown && notification.read && "border-border/60 hover:border-border"
      )}
      onClick={handleClick}
    >
      {!notification.read && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-sm shadow-primary/30" />
      )}
      
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm",
        !notification.read && "border-primary/30 text-primary bg-primary/5"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium leading-tight",
            notification.read ? "text-foreground" : "text-foreground font-bold"
          )}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5 font-medium">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className={cn(
          "text-sm line-clamp-2",
          notification.read ? "text-muted-foreground" : "text-foreground/90 font-medium"
        )}>
          {notification.message}
        </p>
        
        {targetRoute && !isDropdown && (
          <div className="mt-2.5 flex">
            <span className="inline-flex items-center text-xs font-bold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors">
              {notification.actionLabel || "View details"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
