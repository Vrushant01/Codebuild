import React from "react"
import { useAuth } from "../../lib/auth/AuthContext"

interface PermissionGateProps {
  permission?: string // e.g., 'organizations.approve', left optional for mock flexibility
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth()
  
  // In a real app, this would check specific RBAC claims
  // For the frontend mock, just being an ADMIN is enough for admin permissions
  const hasAccess = user?.role === "ADMIN"
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}
