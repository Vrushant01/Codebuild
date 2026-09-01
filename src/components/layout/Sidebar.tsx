import React from "react"
import { NavLink } from "react-router-dom"
import { Home, MessageSquare, Map as MapIcon, Calendar, Clock, User, Users, Building, Settings, LayoutDashboard, Activity, Stethoscope, Star, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

import { useTranslation } from "../../lib/i18n/useTranslation"

export type NavItem = {
  titleKey: string;
  href: string;
  icon: React.ElementType;
}

const patientNav: NavItem[] = [
  { titleKey: "navigation.home", href: "/app/patient", icon: Home },
  { titleKey: "navigation.schedule", href: "/app/patient/schedule", icon: Activity },
  { titleKey: "navigation.map", href: "/app/patient/map", icon: MapIcon },
  { titleKey: "navigation.appointments", href: "/app/patient/appointments", icon: Calendar },
  { titleKey: "navigation.chat", href: "/app/patient/chat", icon: MessageSquare },
  { titleKey: "navigation.reviews", href: "/app/patient/reviews", icon: Star },
  { titleKey: "navigation.profile", href: "/app/patient/profile", icon: User },
]

const doctorNav: NavItem[] = [
  { titleKey: "navigation.dashboard", href: "/app/doctor", icon: LayoutDashboard },
  { titleKey: "navigation.appointments", href: "/app/doctor/appointments", icon: Calendar },
  { titleKey: "navigation.patients", href: "/app/doctor/patients", icon: Users },
  { titleKey: "navigation.scanner", href: "/app/doctor/scanner", icon: QrCode },
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

interface SidebarProps {
  role: "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN";
  className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
  const { t } = useTranslation()
  let items = patientNav;
  if (role === "DOCTOR") items = doctorNav;
  if (role === "ADMIN") items = orgNav;
  if (role === "RECEPTIONIST") items = receptionistNav;

  return (
    <div className={cn("pb-12 h-screen border-r bg-background w-64 flex-shrink-0 hidden md:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-6 py-2">
          <h2 className="mb-2 px-2 text-2xl font-heading font-bold text-primary tracking-tight">
            MEDIREACH
          </h2>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/app/patient" || item.href === "/app/doctor" || item.href === "/app/organization" || item.href === "/app/receptionist"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {t(item.titleKey)}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BottomNav({ role }: { role: "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN" }) {
  const { t } = useTranslation()
  let items = patientNav;
  if (role === "DOCTOR") items = doctorNav;
  if (role === "ADMIN") items = orgNav;
  if (role === "RECEPTIONIST") items = receptionistNav;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur z-40 pb-safe">
      <div className="flex h-full items-center justify-around px-2">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/app/patient" || item.href === "/app/doctor" || item.href === "/app/organization" || item.href === "/app/receptionist"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium truncate w-full text-center px-1">{t(item.titleKey)}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
