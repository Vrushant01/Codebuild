import React from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { useNotifications } from "../../lib/notifications/NotificationContext"
import { NotificationCard } from "./NotificationCard"
import { cn } from "../../lib/utils"

export function NotificationDropdown() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { notifications, unreadCount, markAllAsRead } = useNotifications()

  // Desktop: Only show the latest 4 notifications
  const latestNotifications = notifications.slice(0, 4)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span 
              className={cn(
                "absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground",
                "animate-in zoom-in-50 duration-300"
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[380px] p-0 mr-4" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold">Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead()}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {latestNotifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {latestNotifications.map(n => (
                <NotificationCard 
                  key={n.id} 
                  notification={n} 
                  onClose={() => setOpen(false)} 
                  isDropdown
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t bg-muted/30">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-sm font-medium"
            onClick={() => {
              navigate("/app/patient/notifications")
              setOpen(false)
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
