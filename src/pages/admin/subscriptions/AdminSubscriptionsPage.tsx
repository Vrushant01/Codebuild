import React, { useState, useEffect } from "react"
import { Search, CreditCard, Calendar } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"
import type { OrganizationSubscription } from "../../../lib/admin/admin-types"

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<OrganizationSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadSubscriptions = async () => {
      setLoading(true)
      const data = await adminService.getSubscriptions()
      setSubscriptions(data)
      setLoading(false)
    }
    loadSubscriptions()
  }, [])

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.organizationId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700"
      case "PAUSED": return "bg-amber-100 text-amber-700"
      case "EXPIRED": return "bg-destructive/10 text-destructive"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Overview of organization subscription plans. Conceptual mock view.</p>
      </div>

      <div className="bg-card border rounded-3xl p-4 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search subscriptions by organization ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No subscriptions found</h3>
        </div>
      ) : (
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Organization ID</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Renewal Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{sub.organizationId}</td>
                    <td className="px-6 py-4 text-muted-foreground">{sub.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(sub.renewalDate).toLocaleDateString()}
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
