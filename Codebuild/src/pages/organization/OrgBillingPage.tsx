import React, { useState, useEffect } from "react"
import { 
  CreditCard, 
  Users, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  ArrowUpRight, 
  ShieldCheck, 
  Stethoscope, 
  Building2, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { billingService } from "../../lib/billing/billing-service"
import { openRazorpayModal } from "../../lib/billing/razorpay"
import type { OrganizationBillingSummary } from "../../lib/billing/billing-types"
import { toast } from "react-hot-toast"

export default function OrgBillingPage() {
  const [billing, setBilling] = useState<OrganizationBillingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [activeTab, setActiveTab] = useState<"CURRENT" | "HISTORY">("CURRENT")

  const loadBilling = async () => {
    setLoading(true)
    const data = await billingService.getOrganizationBillingSummary()
    setBilling(data)
    setLoading(false)
  }

  useEffect(() => {
    loadBilling()
  }, [])

  const handlePayWithRazorpay = async () => {
    if (!billing) return
    setPaying(true)

    try {
      // 1. Create order on backend
      const order = await billingService.createPaymentOrder(billing.totalAmountDue, billing.currentInvoiceId)
      
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || (import.meta.env as any).NEXT_PUBLIC_RAZORPAY_KEY_ID || (import.meta.env as any).REZERPAY_API_KEY || order.keyId || "rzp_test_TDo2AY2cIWWoA0"

      // 2. Open Razorpay Checkout Modal
      await openRazorpayModal({
        key: keyId,
        amount: order.amount,
        currency: "INR",
        name: "MEDIREACH Platform",
        description: `Platform Commission Settlement - ${billing.cycleName} (${billing.totalAttendedPatients} Patients × ₹10)`,
        order_id: order.orderId,
        prefill: {
          name: billing.organizationName,
          email: "billing@" + billing.organizationName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".org"
        },
        theme: {
          color: "#0F766E" // Emerald Primary
        },
        handler: async (response) => {
          try {
            toast.loading("Verifying payment with MEDIREACH...", { id: "pay-verify" })
            await billingService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              invoiceId: billing.currentInvoiceId,
              amount: billing.totalAmountDue
            })
            toast.success("Payment successful! Invoice marked as PAID.", { id: "pay-verify" })
            await loadBilling()
          } catch (err: any) {
            toast.error(err?.message || "Payment verification failed", { id: "pay-verify" })
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false)
            toast("Payment cancelled", { icon: "ℹ️" })
          }
        }
      })
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize Razorpay checkout")
      setPaying(false)
    }
  }

  if (loading || !billing) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-3xl" />)}
        </div>
        <div className="h-80 bg-muted rounded-3xl" />
      </div>
    )
  }

  const isPaid = billing.status === "PAID"

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 rounded-[2rem] border border-primary/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary px-3 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Pay-Per-Patient Model
            </span>
            <span className="text-xs text-muted-foreground font-medium">• Cycle: {billing.cycleName}</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Platform Commission & Billing</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Fixed <strong>₹{billing.ratePerPatient} per attended patient</strong> consultation acquired via MEDIREACH.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant={activeTab === "CURRENT" ? "default" : "outline"} 
            onClick={() => setActiveTab("CURRENT")}
            className="rounded-xl font-bold text-sm"
          >
            Current Cycle
          </Button>
          <Button 
            variant={activeTab === "HISTORY" ? "default" : "outline"} 
            onClick={() => setActiveTab("HISTORY")}
            className="rounded-xl font-bold text-sm"
          >
            Invoice History
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Attended Patients */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Attended Patients</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold font-heading">{billing.totalAttendedPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all facility doctors</p>
          </div>
        </div>

        {/* Card 2: Commission Rate */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Rate</span>
            <Building2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-3xl font-bold font-heading">₹{billing.ratePerPatient}</div>
            <p className="text-xs text-muted-foreground mt-1">Per attended consultation</p>
          </div>
        </div>

        {/* Card 3: Total Due & Paid */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Fee Dues</span>
            <Receipt className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-3xl font-bold font-heading text-primary">₹{billing.totalAmountDue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gross: ₹{billing.grossAmount || (billing.totalAttendedPatients * billing.ratePerPatient)} • Paid: ₹{billing.totalPaidAmount || 0}
            </p>
          </div>
        </div>

        {/* Card 4: Settlement Status */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Payment Status</span>
            {billing.totalAmountDue === 0 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${
              billing.totalAmountDue === 0 ? "bg-white text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700" : "bg-white text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
            }`}>
              {billing.totalAmountDue === 0 ? "✓ SETTLED (PAID)" : "Due (UNPAID)"}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {billing.totalAmountDue === 0 ? "All current dues cleared" : `${billing.unpaidPatients || Math.ceil(billing.totalAmountDue / billing.ratePerPatient)} new patient(s) to settle`}
            </p>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {activeTab === "CURRENT" ? (
        <div className="space-y-6">
          
          {/* Doctor Breakdown Table & Razorpay Action */}
          <div className="bg-card border rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" /> Doctor-wise Patient & Fee Breakdown
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detailed contribution of each doctor towards the facility's MEDIREACH patient volume.
                </p>
              </div>

              {/* Settlement Button */}
              {billing.totalAmountDue === 0 ? (
                <div className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 px-4 py-2 rounded-2xl text-sm font-bold shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> All Dues Settled (₹{billing.totalPaidAmount || billing.grossAmount} Paid)
                </div>
              ) : (
                <Button 
                  onClick={handlePayWithRazorpay}
                  disabled={paying || billing.totalAmountDue <= 0}
                  className="bg-primary text-primary-foreground font-bold px-6 py-6 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-base w-full sm:w-auto justify-center"
                >
                  <CreditCard className="w-5 h-5" />
                  {paying ? "Opening Razorpay..." : `Pay Outstanding Fee (₹${billing.totalAmountDue.toLocaleString()})`}
                </Button>
              )}
            </div>

            {/* Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Doctor Name</th>
                    <th className="pb-3 font-semibold">Specialization</th>
                    <th className="pb-3 font-semibold text-center">Attended Patients</th>
                    <th className="pb-3 font-semibold text-right">Fee Rate</th>
                    <th className="pb-3 font-semibold text-right">Subtotal Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {billing.doctorBreakdown.map((doc, idx) => (
                    <tr key={doc.doctorId || idx} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4 font-bold text-foreground flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {doc.doctorName.replace("Dr. ", "").substring(0, 2).toUpperCase()}
                        </div>
                        <span>{doc.doctorName}</span>
                      </td>
                      <td className="py-4 text-muted-foreground font-medium">
                        {doc.specialization || "General Medicine"}
                      </td>
                      <td className="py-4 text-center font-bold">
                        <span className="bg-muted px-3 py-1 rounded-xl text-xs">
                          {doc.patientCount} patients
                        </span>
                      </td>
                      <td className="py-4 text-right text-muted-foreground font-medium">
                        ₹{doc.rate} / pt
                      </td>
                      <td className="py-4 text-right font-bold text-foreground">
                        ₹{doc.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary/20 bg-muted/20 font-bold text-sm">
                    <td colSpan={2} className="py-3 px-2">Gross Total Platform Fee:</td>
                    <td className="py-3 text-center font-bold text-primary">
                      {billing.totalAttendedPatients} Patients
                    </td>
                    <td className="py-3 text-right text-xs text-muted-foreground">
                      × ₹{billing.ratePerPatient} per patient
                    </td>
                    <td className="py-3 text-right font-bold text-foreground">
                      ₹{(billing.grossAmount || (billing.totalAttendedPatients * billing.ratePerPatient)).toLocaleString()}
                    </td>
                  </tr>
                  {billing.totalPaidAmount > 0 && (
                    <tr className="border-t border-border/40 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      <td colSpan={4} className="py-2.5 px-2">Already Settled (Paid in Previous Invoices):</td>
                      <td className="py-2.5 text-right font-bold">
                        - ₹{billing.totalPaidAmount.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold text-base">
                    <td colSpan={4} className="py-3 px-2 text-foreground">Net Outstanding Due (Payable Now):</td>
                    <td className="py-3 text-right text-xl font-heading text-primary">
                      ₹{billing.totalAmountDue.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Model Explanation Box */}
            <div className="bg-muted/30 border border-dashed rounded-2xl p-5 flex items-start gap-4">
              <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="font-bold text-foreground text-sm">How MEDIREACH Commission Works</p>
                <p>
                  When patients discover and book consultations at <strong>{billing.organizationName}</strong> through the MEDIREACH website, 
                  your facility only pays a small fixed fee of <strong>₹10 per completed patient consultation</strong>. Doctors independently see their individual patient counts, 
                  and the consolidated total is settled directly via Razorpay.
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* History Tab */
        <div className="bg-card border rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> Past Monthly Invoices & Receipts
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              History of all MEDIREACH platform fee settlements and Razorpay receipts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Billing Cycle</th>
                  <th className="pb-3 font-semibold text-center">Patients Attended</th>
                  <th className="pb-3 font-semibold text-right">Fee Rate</th>
                  <th className="pb-3 font-semibold text-right">Total Amount</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Razorpay Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {billing.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 font-bold text-foreground">{inv.cycleName}</td>
                    <td className="py-4 text-center font-semibold">{inv.totalPatients}</td>
                    <td className="py-4 text-right text-muted-foreground">₹{inv.ratePerPatient}</td>
                    <td className="py-4 text-right font-bold text-foreground">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        inv.status === "PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-mono text-xs text-muted-foreground">
                      {inv.razorpayPaymentId || "—"}
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
