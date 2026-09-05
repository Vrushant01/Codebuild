import React, { useState, useEffect } from "react"
import { 
  Search, 
  CreditCard, 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Sparkles, 
  DollarSign, 
  Filter, 
  ShieldCheck 
} from "lucide-react"
import { billingService } from "../../../lib/billing/billing-service"
import type { AdminBillingOverview, AdminOrganizationBilling } from "../../../lib/billing/billing-types"

export default function AdminSubscriptionsPage() {
  const [overview, setOverview] = useState<AdminBillingOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL")

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true)
      const data = await billingService.getAdminBillingOverview()
      setOverview(data)
      setLoading(false)
    }
    loadOverview()
  }, [])

  const organizations = overview?.organizations || []

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = 
      org.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.organizationId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || org.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 rounded-[2rem] border border-primary/15">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary px-3 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Platform Monetization
          </span>
          <span className="text-xs text-muted-foreground font-medium">• Fixed Rate: ₹10 / Attended Patient</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Subscriptions & Commission Ledger</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Real-time tracking of patient consultations generated through MEDIREACH and ₹10/patient platform fees collected from organizations.
        </p>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Platform Earnings</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-primary">₹{overview.grossPlatformRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{overview.totalAttendedPatients} attended patients × ₹10</p>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Total Attended Leads</span>
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-foreground">{overview.totalAttendedPatients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all organizations</p>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Settled (Razorpay)</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
                ₹{overview.totalPaidRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Paid directly by organizations</p>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Dues</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-amber-600 dark:text-amber-400">
                ₹{overview.totalUnpaidDues.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unsettled platform commissions</p>
            </div>
          </div>

        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border rounded-3xl p-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search organization by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border rounded-2xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          <span className="text-xs font-bold text-muted-foreground">Status:</span>
          {(["ALL", "PAID", "UNPAID"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === status 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations Billing Table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-3xl" />)}
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="bg-card border border-dashed rounded-[2rem] p-12 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No organization records found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Organization</th>
                  <th className="px-6 py-4 font-semibold">City</th>
                  <th className="px-6 py-4 font-semibold text-center">Affiliated Doctors</th>
                  <th className="px-6 py-4 font-semibold text-center">Attended Patients</th>
                  <th className="px-6 py-4 font-semibold text-right">Fee Rate</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Commission</th>
                  <th className="px-6 py-4 font-semibold text-center">Settlement Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Razorpay Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrganizations.map((org) => {
                  const isPaid = org.status === "PAID"
                  return (
                    <tr key={org.organizationId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p>{org.organizationName}</p>
                            <p className="text-[11px] text-muted-foreground font-normal">{org.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">{org.city}</td>
                      <td className="px-6 py-4 text-center font-semibold">
                        <span className="bg-muted px-2.5 py-1 rounded-xl text-xs">{org.doctorCount} Doctors</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        <span className="text-primary">{org.totalPatients} Patients</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-foreground text-base">₹{org.totalAmount.toLocaleString()}</div>
                        {(org.paidAmount ?? 0) > 0 && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            Paid: ₹{(org.paidAmount ?? 0).toLocaleString()}
                          </div>
                        )}
                        {(org.outstandingDue ?? 0) > 0 && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            Due: ₹{(org.outstandingDue ?? 0).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-xs ${
                          isPaid 
                            ? "bg-white text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700" 
                            : "bg-white text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                          {isPaid ? "PAID" : `DUE (₹${org.outstandingDue ?? org.totalAmount})`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-muted-foreground">
                        {org.razorpayPaymentId || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
