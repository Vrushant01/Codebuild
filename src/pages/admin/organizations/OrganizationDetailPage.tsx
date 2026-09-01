import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Building, MapPin, Mail, Phone, Globe, CheckCircle, XCircle, AlertCircle, PlayCircle, StopCircle, ArrowLeft } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog"
import type { OrganizationStatus } from "../../../lib/admin/admin-types"
import { toast } from "react-hot-toast"

export default function OrganizationDetailPage() {
  const { organizationId } = useParams()
  const navigate = useNavigate()
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Dialog States
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showSuspend, setShowSuspend] = useState(false)
  const [showActivate, setShowActivate] = useState(false)

  const loadData = async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      const data = await adminService.getOrganization(organizationId)
      setOrg(data)
    } catch (err) {
      toast.error("Organization not found")
      navigate("/admin/organizations")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [organizationId])

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action()
      toast.success(successMessage)
      loadData()
    } catch (err) {
      toast.error("Action failed")
    }
    closeAllDialogs()
  }

  const closeAllDialogs = () => {
    setShowApprove(false)
    setShowReject(false)
    setShowSuspend(false)
    setShowActivate(false)
  }

  if (loading || !org) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-64 bg-muted rounded-3xl" />
        <div className="h-96 bg-muted rounded-3xl" />
      </div>
    )
  }

  const getStatusColor = (status: OrganizationStatus) => {
    switch(status) {
      case "PENDING": return "bg-amber-100 text-amber-700"
      case "APPROVED": return "bg-blue-100 text-blue-700"
      case "ACTIVE": return "bg-emerald-100 text-emerald-700"
      case "SUSPENDED": return "bg-destructive/10 text-destructive"
      case "INACTIVE": return "bg-muted text-muted-foreground"
      case "REJECTED": return "bg-destructive/20 text-destructive"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/admin/organizations")}
          className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Organization Detail</h1>
          <p className="text-sm text-muted-foreground">ID: {org.id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Status Banner */}
            <div className={`absolute top-0 inset-x-0 h-1.5 ${
              org.status === 'PENDING' ? 'bg-amber-400' :
              org.status === 'ACTIVE' ? 'bg-emerald-500' :
              org.status === 'SUSPENDED' ? 'bg-destructive' :
              'bg-muted-foreground'
            }`} />

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <Building className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold font-heading">{org.name}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusColor(org.status)}`}>
                    {org.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <span className="bg-muted px-2 py-0.5 rounded-md text-xs font-medium">{org.type}</span>
                  <span>•</span>
                  <span>{org.organizationId}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{org.address}, {org.city}</span>
                  </div>
                  {org.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{org.email}</span>
                    </div>
                  )}
                  {org.contact && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span className="truncate">{org.contact}</span>
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="truncate">{org.website}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {org.description && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2 text-sm">About</h4>
                <p className="text-sm text-muted-foreground">{org.description}</p>
              </div>
            )}
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Operations & Staff</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-2xl">
                <div className="text-sm text-muted-foreground mb-1">Doctors</div>
                <div className="text-2xl font-bold">{org.doctorIds?.length || 0}</div>
                <button className="text-xs text-primary font-medium mt-2 hover:underline">View doctors</button>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl">
                <div className="text-sm text-muted-foreground mb-1">Specializations</div>
                <div className="text-2xl font-bold">{org.specializations?.length || 0}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl">
                <div className="text-sm text-muted-foreground mb-1">Telemedicine</div>
                <div className="text-lg font-bold mt-1">
                  {org.onlineConsultation ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Available</span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1"><XCircle className="w-4 h-4"/> N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions & Status */}
        <div className="space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Admin Actions</h3>
            
            {org.status === 'PENDING' && (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl text-sm text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-5 h-5 mb-2" />
                  This organization is waiting for platform approval.
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowApprove(true)}>
                  Approve Organization
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowReject(true)}>
                  Reject
                </Button>
              </div>
            )}

            {(org.status === 'APPROVED' || org.status === 'SUSPENDED' || org.status === 'INACTIVE') && (
              <div className="space-y-3">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowActivate(true)}>
                  <PlayCircle className="w-4 h-4 mr-2" /> Activate Organization
                </Button>
              </div>
            )}

            {org.status === 'ACTIVE' && (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl text-sm text-emerald-800 dark:text-emerald-200">
                  <CheckCircle className="w-5 h-5 mb-2" />
                  This organization is currently active on the platform.
                </div>
                <Button variant="outline" className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => setShowSuspend(true)}>
                  <StopCircle className="w-4 h-4 mr-2" /> Suspend Organization
                </Button>
              </div>
            )}

            {org.status === 'REJECTED' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-sm text-destructive">
                <XCircle className="w-5 h-5 mb-2" />
                This organization request was rejected.
              </div>
            )}
            
            <div className="pt-4 border-t">
              <Button variant="secondary" className="w-full" onClick={() => navigate("/admin/listings")}>
                Manage Listing Visibility
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Dialogs */}
      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Organization?</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve <strong>{org.name}</strong>? This will mark their profile as approved, and they can be activated for the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowApprove(false)}>Cancel</Button>
            <Button onClick={() => handleAction(() => adminService.approveOrganization(org.id), "Organization approved")}>
              Approve Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Organization?</DialogTitle>
            <DialogDescription>
              This will reject the application for <strong>{org.name}</strong>. This action cannot be undone easily.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction(() => adminService.rejectOrganization(org.id, "Did not meet criteria"), "Organization rejected")}>
              Reject Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showActivate} onOpenChange={setShowActivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Organization?</DialogTitle>
            <DialogDescription>
              This will activate <strong>{org.name}</strong>. They will be able to manage appointments and staff on the platform. (Discovery is governed by Listing Visibility).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowActivate(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(() => adminService.activateOrganization(org.id), "Organization activated")}>
              Activate Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuspend} onOpenChange={setShowSuspend}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Organization?</DialogTitle>
            <DialogDescription>
              Suspending this organization will remove it from active platform operations. Are you sure you want to suspend <strong>{org.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSuspend(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction(() => adminService.suspendOrganization(org.id), "Organization suspended")}>
              Suspend Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
