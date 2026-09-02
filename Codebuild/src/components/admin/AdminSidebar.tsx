import React from "react"
import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, 
  Building, 
  Stethoscope, 
  Users, 
  UserSquare2, 
  Calendar, 
  Eye, 
  CreditCard, 
  Settings,
  X
} from "lucide-react"

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Organizations", href: "/admin/organizations", icon: Building },
  { title: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { title: "Receptionists", href: "/admin/receptionists", icon: UserSquare2 },
  { title: "Patients", href: "/admin/patients", icon: Users },
  { title: "Appointments", href: "/admin/appointments", icon: Calendar },
  { title: "Listings", href: "/admin/listings", icon: Eye },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-card border-r flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
          <div className="font-heading font-bold text-xl text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm">
              M
            </span>
            Admin
          </div>
          <button 
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/admin/dashboard"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.title}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  )
}
