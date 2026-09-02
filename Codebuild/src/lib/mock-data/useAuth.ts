import { useState, useEffect } from "react"

export type Role = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

// Global mock state for demonstration
let mockRole: Role = "PATIENT"

export const setMockRole = (role: Role) => {
  mockRole = role
  // Dispatch custom event to trigger re-renders across components
  window.dispatchEvent(new Event("mock-role-change"))
}

export function useAuth() {
  const [role, setRole] = useState<Role>(mockRole)
  const [user, setUser] = useState<User | null>({
    id: "usr_123",
    name: "Alex Johnson",
    email: "alex@example.com"
  })

  useEffect(() => {
    const handleRoleChange = () => {
      setRole(mockRole)
    }
    window.addEventListener("mock-role-change", handleRoleChange)
    return () => window.removeEventListener("mock-role-change", handleRoleChange)
  }, [])

  return { user, role, setRole: setMockRole }
}
