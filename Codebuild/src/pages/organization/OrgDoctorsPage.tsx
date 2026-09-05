import React, { useState, useEffect } from "react"
import { organizationService } from "../../lib/organization/organization-service"
import { AddStaffModal } from "../../components/organization/AddStaffModal"
import { ManageDoctorModal } from "../../components/organization/ManageDoctorModal"
import type { OrganizationDoctor } from "../../lib/organization/organization-types"
import { Stethoscope, UserPlus, Search, ShieldCheck } from "lucide-react"

export default function OrgDoctorsPage() {
  const [doctors, setDoctors] = useState<OrganizationDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<OrganizationDoctor | null>(null)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const data = await organizationService.getDoctors()
    setDoctors(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddDoctor = async (data: any) => {
    await organizationService.addDoctor(data)
    await loadData()
  }

  const handleOpenManage = (doctor: OrganizationDoctor) => {
    setSelectedDoctor(doctor)
    setIsManageModalOpen(true)
  }

  const handleSaveDoctor = async (id: string, data: any) => {
    await organizationService.updateDoctor(id, data)
    await loadData()
  }

  const handleDeleteDoctor = async (id: string) => {
    await organizationService.removeDoctorAssociation(id)
    await loadData()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Associated Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage healthcare providers linked to your organization.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-5 h-5" /> Add Doctor
        </button>
      </div>

      <div className="bg-card border rounded-3xl p-2 pl-4 flex items-center shadow-sm w-full md:max-w-md focus-within:ring-2 ring-primary transition-all mb-6">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input 
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search doctors by name or specialty..."
          className="w-full bg-transparent border-none focus:outline-none px-3 py-2"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No doctors found</h3>
          <p className="text-muted-foreground mt-1">Click "Add Doctor" to associate a new provider.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(doctor => (
            <div key={doctor.id} className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                  {doctor.name.replace("Dr. ", "").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold leading-tight mb-1">{doctor.name}</h4>
                  <p className="text-sm font-medium text-primary mb-1.5">{doctor.specialization}</p>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${
                    doctor.status === "Active" 
                      ? "bg-white text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700" 
                      : "bg-white text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                  }`}>
                    {doctor.status === "Active" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    {doctor.status}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground font-medium">
                  Availability: <span className="text-foreground capitalize">{doctor.availability?.status || "available"}</span>
                </div>
                <button 
                  onClick={() => handleOpenManage(doctor)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Manage
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        role="Doctor" 
        onSave={handleAddDoctor} 
      />

      <ManageDoctorModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false)
          setSelectedDoctor(null)
        }}
        doctor={selectedDoctor}
        onSave={handleSaveDoctor}
        onDelete={handleDeleteDoctor}
      />
    </div>
  )
}
