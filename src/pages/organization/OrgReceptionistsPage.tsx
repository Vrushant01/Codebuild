import React, { useState, useEffect } from "react"
import { organizationService } from "../../lib/organization/organization-service"
import { AddStaffModal } from "../../components/organization/AddStaffModal"
import type { Receptionist } from "../../lib/organization/organization-types"
import { Users, UserPlus, Search, CalendarClock, ShieldCheck } from "lucide-react"

export default function OrgReceptionistsPage() {
  const [staff, setStaff] = useState<Receptionist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const data = await organizationService.getReceptionists()
    setStaff(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = staff.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddReceptionist = async (data: any) => {
    await organizationService.addReceptionist(data)
    await loadData()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Receptionists</h1>
          <p className="text-muted-foreground mt-1">Manage support staff and their permissions.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-5 h-5" /> Add Staff
        </button>
      </div>

      <div className="bg-card border rounded-3xl p-2 pl-4 flex items-center shadow-sm w-full md:max-w-md focus-within:ring-2 ring-primary transition-all mb-6">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input 
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search staff by name or email..."
          className="w-full bg-transparent border-none focus:outline-none px-3 py-2"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-32 bg-muted rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No staff found</h3>
          <p className="text-muted-foreground mt-1">Click "Add Staff" to invite a receptionist.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(person => (
            <div key={person.id} className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-6 justify-between md:items-center">
              
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xl shrink-0">
                  {person.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">{person.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{person.email}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    person.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {person.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 max-w-lg bg-muted/30 border border-dashed rounded-2xl p-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Permissions Summary
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {person.permissions.appointmentManagement ? <span className="text-emerald-500">✓</span> : <span className="text-muted-foreground opacity-50">—</span>}
                    <span className={person.permissions.appointmentManagement ? "text-foreground" : "text-muted-foreground opacity-50"}>Appointment Mgmt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {person.permissions.patientBooking ? <span className="text-emerald-500">✓</span> : <span className="text-muted-foreground opacity-50">—</span>}
                    <span className={person.permissions.patientBooking ? "text-foreground" : "text-muted-foreground opacity-50"}>Patient Booking</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground line-through decoration-muted-foreground/30">Medical Diagnosis</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground line-through decoration-muted-foreground/30">Prescription Mgmt</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="text-sm font-bold text-primary hover:underline whitespace-nowrap">
                  Manage Access
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        role="Receptionist" 
        onSave={handleAddReceptionist} 
      />
    </div>
  )
}
