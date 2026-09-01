import React from "react"
import { permissionService } from "../../lib/receptionist/permission-service"
import type { ReceptionistPermission } from "../../lib/receptionist/receptionist-types"
import { ShieldAlert } from "lucide-react"

interface PermissionGateProps {
  permission: keyof ReceptionistPermission
  children: React.ReactNode
  fallback?: React.ReactNode
  showDeniedMessage?: boolean
}

export function PermissionGate({ 
  permission, 
  children, 
  fallback = null, 
  showDeniedMessage = false 
}: PermissionGateProps) {
  
  const hasAccess = permissionService.hasPermission(permission)

  if (hasAccess) {
    return <>{children}</>
  }

  if (showDeniedMessage) {
    return (
      <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-5 flex items-start gap-4 text-destructive">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Protected Information</h4>
          <p className="text-sm mt-1 opacity-90">
            Clinical information is available only to authorized healthcare providers. 
            Your organization administrator has not enabled this action.
          </p>
        </div>
      </div>
    )
  }

  return <>{fallback}</>
}
