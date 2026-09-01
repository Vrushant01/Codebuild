import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
