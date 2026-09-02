import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Home, 
  Map as MapIcon, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Building, 
  Settings, 
  LayoutDashboard, 
  Activity, 
  Stethoscope, 
  Star, 
  QrCode, 
  CreditCard,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "../../lib/i18n/useTranslation"

export type NavItem = {
  titleKey: string
  href: string
  icon: React.ElementType
}

const patientNav: NavItem[] = [
  { titleKey: "navigation.home", href: "/app/patient", icon: Home },
  { titleKey: "navigation.schedule", href: "/app/patient/schedule", icon: Activity },
  { titleKey: "navigation.map", href: "/app/patient/map", icon: MapIcon },
  { titleKey: "navigation.appointments", href: "/app/patient/appointments", icon: Calendar },
  { titleKey: "navigation.reviews", href: "/app/patient/reviews", icon: Star },
  { titleKey: "navigation.profile", href: "/app/patient/profile", icon: User },
]

const doctorNav: NavItem[] = [
  { titleKey: "navigation.dashboard", href: "/app/doctor", icon: LayoutDashboard },
  { titleKey: "navigation.appointments", href: "/app/doctor/appointments", icon: Calendar },
  { titleKey: "navigation.patients", href: "/app/doctor/patients", icon: Users },
  { titleKey: "navigation.schedule", href: "/app/doctor/schedule", icon: Clock },
  { titleKey: "navigation.feedback", href: "/app/doctor/feedback", icon: Star },
  { titleKey: "navigation.profile", href: "/app/doctor/profile", icon: User },
]

const orgNav: NavItem[] = [
  { titleKey: "navigation.dashboard", href: "/app/organization", icon: LayoutDashboard },
  { titleKey: "navigation.appointments", href: "/app/organization/appointments", icon: Calendar },
  { titleKey: "navigation.doctors", href: "/app/organization/doctors", icon: Stethoscope },
  { titleKey: "navigation.receptionists", href: "/app/organization/receptionists", icon: Users },
  { titleKey: "navigation.services", href: "/app/organization/services", icon: Activity },
  { titleKey: "navigation.feedback", href: "/app/organization/feedback", icon: Star },
  { titleKey: "navigation.billing", href: "/app/organization/billing", icon: CreditCard },
  { titleKey: "navigation.profile", href: "/app/organization/profile", icon: Building },
  { titleKey: "navigation.settings", href: "/app/organization/settings", icon: Settings },
]

const receptionistNav: NavItem[] = [
  { titleKey: "navigation.dashboard", href: "/app/receptionist", icon: LayoutDashboard },
  { titleKey: "navigation.appointments", href: "/app/receptionist/appointments", icon: Calendar },
  { titleKey: "navigation.patients", href: "/app/receptionist/patients", icon: Users },
  { titleKey: "navigation.scanner", href: "/app/receptionist/scanner", icon: QrCode },
  { titleKey: "navigation.schedule", href: "/app/receptionist/schedule", icon: Clock },
  { titleKey: "navigation.organization", href: "/app/receptionist/organization", icon: Building },
  { titleKey: "navigation.profile", href: "/app/receptionist/profile", icon: User },
]

// Top 5 primary action tabs for bottom mobile bar
const patientBottomNav: NavItem[] = [
  { titleKey: "navigation.home", href: "/app/patient", icon: Home },
  { titleKey: "navigation.schedule", href: "/app/patient/schedule", icon: Activity },
  { titleKey: "navigation.map", href: "/app/patient/map", icon: MapIcon },
  { titleKey: "navigation.appointments", href: "/app/patient/appointments", icon: Calendar },
  { titleKey: "navigation.profile", href: "/app/patient/profile", icon: User },
]

const doctorBottomNav: NavItem[] = [
  { titleKey: "navigation.dashboard", href: "/app/doctor", icon: LayoutDashboard },
  { titleKey: "navigation.appointments", href: "/app/doctor/appointments", icon: Calendar },
  { titleKey: "navigation.patients", href: "/app/doctor/patients", icon: Users },
  { titleKey: "navigation.schedule", href: "/app/doctor/schedule", icon: Clock },
  { titleKey: "navigation.profile", href: "/app/doctor/profile", icon: User },
]

const orgBottomNav: NavItem[] = [
  { titleKey: "navigation.dashboard", href: "/app/organization", icon: LayoutDashboard },
  { titleKey: "navigation.appointments", href: "/app/organization/appointments", icon: Calendar },
  { titleKey: "navigation.doctors", href: "/app/organization/doctors", icon: Stethoscope },
  { titleKey: "navigation.billing", href: "/app/organization/billing", icon: CreditCard },
  { titleKey: "navigation.profile", href: "/app/organization/profile", icon: Building },
]

const receptionistBottomNav: NavItem[] = [
  { titleKey: "navigation.dashboard", href: "/app/receptionist", icon: LayoutDashboard },
  { titleKey: "navigation.appointments", href: "/app/receptionist/appointments", icon: Calendar },
  { titleKey: "navigation.patients", href: "/app/receptionist/patients", icon: Users },
  { titleKey: "navigation.scanner", href: "/app/receptionist/scanner", icon: QrCode },
  { titleKey: "navigation.profile", href: "/app/receptionist/profile", icon: User },
]

interface SidebarProps {
  role: "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "ORGANIZATION"
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ role, className, isOpen = false, onClose }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()

  let items = patientNav
  if (location.pathname.startsWith("/app/organization") || role === "ORGANIZATION") {
    items = orgNav
  } else if (location.pathname.startsWith("/app/doctor") || role === "DOCTOR") {
    items = doctorNav
  } else if (location.pathname.startsWith("/app/receptionist") || role === "RECEPTIONIST") {
    items = receptionistNav
  } else if (location.pathname.startsWith("/app/patient") || role === "PATIENT") {
    items = patientNav
  } else if (role === "ADMIN") {
    items = orgNav
  }

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-5 flex items-center justify-between border-b shrink-0">
        <h2 className="text-2xl font-heading font-bold text-primary tracking-tight">
          MEDIREACH
        </h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden text-muted-foreground hover:text-foreground p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/app/patient" || item.href === "/app/doctor" || item.href === "/app/organization" || item.href === "/app/receptionist"}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{t(item.titleKey)}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className={cn("pb-12 h-screen border-r bg-card w-64 flex-shrink-0 hidden md:block", className)}>
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" 
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-card border-r shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

export function BottomNav({ role }: { role: "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "ORGANIZATION" }) {
  const { t } = useTranslation()
  const location = useLocation()

  let items = patientBottomNav
  if (location.pathname.startsWith("/app/organization") || role === "ORGANIZATION") {
    items = orgBottomNav
  } else if (location.pathname.startsWith("/app/doctor") || role === "DOCTOR") {
    items = doctorBottomNav
  } else if (location.pathname.startsWith("/app/receptionist") || role === "RECEPTIONIST") {
    items = receptionistBottomNav
  } else if (location.pathname.startsWith("/app/patient") || role === "PATIENT") {
    items = patientBottomNav
  } else if (role === "ADMIN") {
    items = orgBottomNav
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-card/95 backdrop-blur-md z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex h-full items-center justify-around px-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/app/patient" || item.href === "/app/doctor" || item.href === "/app/organization" || item.href === "/app/receptionist"}
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
                  {t(item.titleKey)}
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
  )
}
