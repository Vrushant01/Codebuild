import React, { useState, useEffect } from "react"
import { Search, UserSquare2 } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"

export default function AdminReceptionistsPage() {
  const [receptionists, setReceptionists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadReceptionists = async () => {
      setLoading(true)
      const data = await adminService.getReceptionists()
      setReceptionists(data)
      setLoading(false)
    }
    loadReceptionists()
  }, [])

  const filteredReceptionists = receptionists.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Receptionists</h1>
        <p className="text-muted-foreground mt-1">Platform overview of organization staff.</p>
      </div>

      <div className="bg-card border rounded-3xl p-4 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search receptionists by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
        </div>
      ) : filteredReceptionists.length === 0 ? (
        <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
          <UserSquare2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No receptionists found</h3>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceptionists.map(r => (
            <div key={r.id} className="bg-card border rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold mb-1">{r.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{r.email}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-muted px-2 py-1 rounded-md">{r.organizationId}</span>
                <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                  r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
