import React, { useState, useEffect } from "react"
import { Search, Users, ShieldAlert } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true)
      const data = await adminService.getPatients()
      setPatients(data)
      setLoading(false)
    }
    loadPatients()
  }, [])

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Patient Directory</h1>
        <p className="text-muted-foreground mt-1">Platform operational directory. Clinical information is protected.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Privacy Notice:</strong> Admin access to patient data is limited to identity and platform operations. Medical history, diagnoses, and clinical notes are restricted to authorized healthcare providers.
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-4 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search patients by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No patients found</h3>
        </div>
      ) : (
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{patient.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{patient.patientId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary hover:underline font-medium">View details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
