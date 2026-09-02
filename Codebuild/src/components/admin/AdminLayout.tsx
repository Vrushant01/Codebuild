import React, { useState } from "react"
import { Outlet, NavLink } from "react-router-dom"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { LayoutDashboard, Building, Stethoscope, CreditCard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const adminBottomNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Organizations", href: "/admin/organizations", icon: Building },
  { title: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { title: "Billing", href: "/admin/subscriptions", icon: CreditCard },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
        
        {/* Mobile Admin Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-card/95 backdrop-blur-md z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex h-full items-center justify-around px-1">
            {adminBottomNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/admin/dashboard"}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 w-full max-w-[72px] h-full transition-colors relative py-1",
                    isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground font-medium"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("h-5 w-5 shrink-0 transition-transform", isActive && "scale-110")} />
                    <span className="text-[10px] leading-tight truncate w-full text-center px-0.5">
                      {item.title}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-1" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
