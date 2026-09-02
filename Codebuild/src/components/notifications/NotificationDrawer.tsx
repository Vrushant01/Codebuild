import React from "react"
import { useNavigate } from "react-router-dom"
import { Check, ArrowRight, BellOff } from "lucide-react"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { useNotifications } from "../../lib/notifications/NotificationContext"
import { NotificationCard } from "./NotificationCard"
import type { AppNotification } from "../../lib/notifications/notification-types"

interface NotificationDrawerProps {
  onClose: () => void
}

export function NotificationDrawer({ onClose }: NotificationDrawerProps) {
  const navigate = useNavigate()
  const { notifications, markAllAsRead, unreadCount } = useNotifications()

  // Take only the top 10 for the drawer
  const previewNotifications = notifications.slice(0, 10)
  
  // Simple grouping: Today vs Earlier
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayNotifications: AppNotification[] = []
  const earlierNotifications: AppNotification[] = []
  
  previewNotifications.forEach(n => {
    const d = new Date(n.createdAt)
    if (d >= today) {
      todayNotifications.push(n)
    } else {
      earlierNotifications.push(n)
    }
  })

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/20">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Check className="mr-2 h-3.5 w-3.5" />
          Mark all as read
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-primary hover:text-primary/80 h-8 px-2"
          onClick={() => {
            navigate("/notifications")
            onClose()
          }}
        >
          View all
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-48 space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">You're all caught up</p>
              <p className="text-xs text-muted-foreground">No new notifications right now.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {todayNotifications.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">Today</h4>
                <div className="grid gap-2">
                  {todayNotifications.map(n => (
                    <NotificationCard key={n.id} notification={n} onClose={onClose} />
                  ))}
                </div>
              </div>
            )}
            
            {earlierNotifications.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">Earlier</h4>
                <div className="grid gap-2">
                  {earlierNotifications.map(n => (
                    <NotificationCard key={n.id} notification={n} onClose={onClose} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
