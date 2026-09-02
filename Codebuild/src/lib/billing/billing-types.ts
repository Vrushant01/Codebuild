export interface DoctorLeadBreakdown {
  doctorId: string
  doctorName: string
  specialization?: string
  patientCount: number
  rate: number
  amount: number
}

export interface BillingInvoiceItem {
  id: string
  billingMonth: string
  cycleName: string
  totalPatients: number
  ratePerPatient: number
  totalAmount: number
  status: "UNPAID" | "PENDING" | "PAID"
  paidAt?: string
  razorpayPaymentId?: string
}

export interface OrganizationBillingSummary {
  organizationId: string
  organizationName: string
  billingMonth: string
  cycleName: string
  ratePerPatient: number
  totalAttendedPatients: number
  grossAmount: number
  totalPaidAmount: number
  totalAmountDue: number
  unpaidPatients: number
  status: "UNPAID" | "PENDING" | "PAID"
  currentInvoiceId?: string
  doctorBreakdown: DoctorLeadBreakdown[]
  invoices: BillingInvoiceItem[]
}

export interface DoctorBillingSummary {
  doctorId: string
  doctorName: string
  specialization: string
  attendedPatientsCount: number
  ratePerPatient: number
  platformFeeGenerated: number
  currency: string
}

export interface AdminOrganizationBilling {
  organizationId: string
  organizationName: string
  city: string
  type: string
  doctorCount: number
  totalPatients: number
  ratePerPatient: number
  totalAmount: number
  paidAmount?: number
  outstandingDue?: number
  status: "UNPAID" | "PENDING" | "PAID"
  lastPaymentDate?: string | null
  razorpayPaymentId?: string | null
}

export interface AdminBillingOverview {
  ratePerPatient: number
  grossPlatformRevenue: number
  totalAttendedPatients: number
  totalPaidRevenue: number
  totalUnpaidDues: number
  totalOrganizations: number
  organizations: AdminOrganizationBilling[]
  recentInvoices: any[]
}

export interface RazorpayOrderResponse {
  orderId: string
  amount: number
  amountInRupees: number
  currency: string
  keyId: string
}
