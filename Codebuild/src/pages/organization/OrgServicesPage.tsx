import React, { useState, useEffect } from "react"
import { organizationService } from "../../lib/organization/organization-service"
import { AddServiceModal } from "../../components/organization/AddServiceModal"
import type { HealthcareService } from "../../lib/organization/organization-types"
import { Activity, Plus, Search, CheckCircle, Ban } from "lucide-react"

export default function OrgServicesPage() {
  const [services, setServices] = useState<HealthcareService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<HealthcareService | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await organizationService.getServices()
      setServices(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  )

  const handleOpenAdd = () => {
    setSelectedService(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (service: HealthcareService) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleSaveService = async (data: any) => {
    if (selectedService) {
      await organizationService.updateService(selectedService.id, data)
    } else {
      await organizationService.addService(data)
    }
    await loadData()
  }

  const handleToggleStatus = async (service: HealthcareService) => {
    await organizationService.disableService(service.id)
    await loadData()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">Manage the medical services offered by your organization.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Service
        </button>
      </div>

      <div className="bg-card border rounded-3xl p-2 pl-4 flex items-center shadow-sm w-full md:max-w-md focus-within:ring-2 ring-primary transition-all mb-6">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input 
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full bg-transparent border-none focus:outline-none px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-muted rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No services found</h3>
          <p className="text-muted-foreground mt-1">Add a new service to let patients know what you offer.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(service => (
            <div key={service.id} className={`bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              service.status === "Inactive" ? "opacity-75 bg-muted/20" : ""
            }`}>
              
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-lg leading-tight">{service.name}</h4>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    service.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                  }`}>
                    {service.status === "Active" ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {service.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{service.description || "Clinical service offering"}</p>
              </div>

              <div className="pt-4 border-t flex items-center justify-between mt-auto">
                <div className="text-xs font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">{service.doctorIds.length}</span> Associated Doctors
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleStatus(service)}
                    className={`text-xs font-bold hover:underline transition-colors ${
                      service.status === "Active" ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {service.status === "Active" ? "Disable" : "Enable"}
                  </button>
                  <button 
                    onClick={() => handleOpenEdit(service)}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <AddServiceModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setSelectedService(null)
        }} 
        onSave={handleSaveService}
        initialService={selectedService}
      />
    </div>
  )
}
