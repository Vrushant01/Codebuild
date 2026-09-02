import React from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "@/lib/auth/AuthContext"
import { PatientShell } from "./PatientShell"
import { ProfessionalShell } from "./ProfessionalShell"

export function AppShell() {
  const { user } = useAuth()

  if (!user) {
    // Optionally return a public shell or redirect to login
    return <Outlet />
  }

  const role = user.role

  if (role === "PATIENT") {
    return <PatientShell />
  }

  // Doctor, Receptionist, Admin, Organization share a professional dashboard layout
  return <ProfessionalShell role={role as "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "ORGANIZATION"} />
}

