import React, { useState, useEffect } from "react"
import { useAuth } from "../../lib/auth/AuthContext"
import { permissionService } from "../../lib/receptionist/permission-service"
import { apiClient } from "../../lib/api/apiClient"
import { User, Shield, Building, Mail, Phone, CheckCircle, XCircle } from "lucide-react"

export default function ReceptionistProfilePage() {
  const { user, logout } = useAuth()
  const [orgName, setOrgName] = useState("Assigned Organization")

  useEffect(() => {
    apiClient.get<{ success: boolean; data: any }>("/organizations/me")
      .then(res => {
        if (res && res.data && res.data.name) {
          setOrgName(res.data.name)
        }
      })
      .catch(() => {})
  }, [])

  // Manually read permissions for display
  const permissions = {
    "Appointment Management": permissionService.hasPermission("canCreateAppointments"),
    "Accept/Reject Requests": permissionService.hasPermission("canApproveAppointments"),
    "Patient Check-in": permissionService.hasPermission("canCheckInPatients"),
    "Cancel Appointments": permissionService.hasPermission("canCancelAppointments"),
    "View Doctor Schedule": permissionService.hasPermission("canViewDoctorAvailability"),
    "Access Medical History": permissionService.hasPermission("canViewMedicalHistory"),
    "Access Clinical Notes": permissionService.hasPermission("canViewClinicalNotes"),
    "Access Diagnoses": permissionService.hasPermission("canViewDiagnosis"),
    "Access Prescriptions": permissionService.hasPermission("canViewMedication")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in space-y-8">
      
      <div>
        <h1 className="text-3xl font-heading font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and view your permissions.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 relative text-2xl font-bold font-heading">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || <User className="w-12 h-12" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-4 w-full">
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || "Receptionist"}</h2>
                  <p className="text-primary font-medium">Front Desk Receptionist</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{orgName}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user?.email || "reception@hospital.org"}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user?.phone || user?.mobile || "+91 98765 43210"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full sm:w-auto bg-destructive/10 text-destructive font-bold px-6 py-3 rounded-xl hover:bg-destructive/20 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Permissions Block */}
        <div className="space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary" /> Active Permissions
            </h3>
            
            <div className="space-y-4">
              {Object.entries(permissions).map(([name, granted]) => (
                <div key={name} className="flex items-start justify-between gap-4">
                  <span className={`text-sm ${granted ? 'font-medium' : 'text-muted-foreground'}`}>{name}</span>
                  {granted ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive/50 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
              Permissions are configured by your organization administrator. Contact them if you need additional access.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
