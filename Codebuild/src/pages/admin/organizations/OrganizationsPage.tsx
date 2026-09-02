import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, Building, Plus } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"
import { Button } from "../../../components/ui/button"
import type { OrganizationStatus } from "../../../lib/admin/admin-types"

export default function OrganizationsPage() {
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | "ALL">("ALL")

  useEffect(() => {
    const loadOrgs = async () => {
      setLoading(true)
      const data = await adminService.getOrganizations()
      setOrganizations(data)
      setLoading(false)
    }
    loadOrgs()
  }, [])

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          org.organizationId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          org.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || org.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Organizations</h1>
          <p className="text-muted-foreground mt-1">Manage platform healthcare organizations.</p>
        </div>
        <Button onClick={() => navigate("/admin/organizations/new")} className="gap-2">
          <Plus className="w-4 h-4" /> Add Organization
        </Button>
      </div>

      <div className="bg-card border rounded-3xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, ID or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-background border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
          <Building className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No organizations found</h3>
          <p className="text-muted-foreground mt-1 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map(org => (
            <div 
              key={org.id} 
              className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              onClick={() => navigate(`/admin/organizations/${org.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{org.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{org.organizationId}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusColor(org.status)}`}>
                  {org.status}
                </span>
              </div>
              
              <div className="mt-auto space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{org.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{org.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctors</span>
                  <span className="font-medium">{org.doctorIds?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
