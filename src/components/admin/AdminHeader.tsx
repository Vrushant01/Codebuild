import React from "react"
import { Menu, Bell } from "lucide-react"
import { useAuth } from "../../lib/auth/AuthContext"
import { NotificationBell } from "../notifications/NotificationBell"

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-muted-foreground hover:text-foreground p-1"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="font-semibold text-lg hidden sm:block">Platform Admin</div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <div className="h-8 w-px bg-border mx-1"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium leading-none">{user?.name || "System Admin"}</div>
            <div className="text-xs text-muted-foreground mt-1">Platform Administrator</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0) || "A"}
          </div>
        </div>
      </div>
    </header>
  )
}
