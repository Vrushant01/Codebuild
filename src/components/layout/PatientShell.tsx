import React from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar, BottomNav } from "./Sidebar"

export function PatientShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role="PATIENT" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <BottomNav role="PATIENT" />
      </div>
    </div>
  )
}

export function ProfessionalShell({ role }: { role: "DOCTOR" | "RECEPTIONIST" | "ADMIN" }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
