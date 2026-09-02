import React, { useState, useEffect } from "react"
import { Search, Stethoscope } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true)
      const data = await adminService.getDoctors()
      setDoctors(data)
      setLoading(false)
    }
    loadDoctors()
  }, [])

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Doctors Directory</h1>
        <p className="text-muted-foreground mt-1">Platform-wide overview of registered doctors.</p>
      </div>

      <div className="bg-card border rounded-3xl p-4 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search doctors by name or specialization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No doctors found</h3>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map(doc => {
            const orgName = typeof doc.organizationId === 'object' ? doc.organizationId?.name : (doc.organizationName || doc.organizationId || "Clinic")
            const initials = (doc.name || "Dr")
              .replace("Dr. ", "")
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)

            return (
              <div key={doc.id || doc._id} className="bg-card border rounded-2xl p-5 shadow-sm">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    {initials || "DR"}
                  </div>
                  <div>
                    <h3 className="font-bold">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                    <p className="text-xs text-muted-foreground mt-2 bg-muted px-2 py-1 rounded-md inline-block">
                      {orgName}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
