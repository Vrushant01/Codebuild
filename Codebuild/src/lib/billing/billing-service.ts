import { apiClient } from "../api/apiClient"
import type { 
  OrganizationBillingSummary, 
  DoctorBillingSummary, 
  AdminBillingOverview,
  RazorpayOrderResponse 
} from "./billing-types"

class BillingService {
  async getOrganizationBillingSummary(): Promise<OrganizationBillingSummary> {
    try {
      const res = await apiClient.get<{ success: boolean; data: OrganizationBillingSummary }>("/billing/organization/summary")
      if (res && res.data) {
        return res.data
      }
    } catch (err) {
      console.warn("Could not fetch organization billing from server:", err)
    }

    // Clean fallback if backend is loading or unreachable
    return {
      organizationId: "",
      organizationName: "Organization",
      billingMonth: "2026-09",
      cycleName: "September 2026",
      ratePerPatient: 10,
      totalAttendedPatients: 0,
      grossAmount: 0,
      totalPaidAmount: 0,
      totalAmountDue: 0,
      unpaidPatients: 0,
      status: "UNPAID",
      currentInvoiceId: "",
      doctorBreakdown: [],
      invoices: []
    }
  }

  async getDoctorBillingSummary(): Promise<DoctorBillingSummary> {
    try {
      const res = await apiClient.get<{ success: boolean; data: DoctorBillingSummary }>("/billing/doctor/summary")
      if (res && res.data) {
        return res.data
      }
    } catch (err) {
      console.warn("Could not fetch doctor billing from server:", err)
    }

    return {
      doctorId: "",
      doctorName: "Doctor",
      specialization: "General Medicine",
      attendedPatientsCount: 0,
      ratePerPatient: 10,
      platformFeeGenerated: 0,
      currency: "INR"
    }
  }

  async getAdminBillingOverview(): Promise<AdminBillingOverview> {
    try {
      const res = await apiClient.get<{ success: boolean; data: AdminBillingOverview }>("/billing/admin/overview")
      if (res && res.data) {
        return res.data
      }
    } catch (err) {
      console.warn("Could not fetch admin billing from server:", err)
    }

    return {
      ratePerPatient: 10,
      grossPlatformRevenue: 0,
      totalAttendedPatients: 0,
      totalPaidRevenue: 0,
      totalUnpaidDues: 0,
      totalOrganizations: 0,
      organizations: [],
      recentInvoices: []
    }
  }

  async createPaymentOrder(amount: number, invoiceId?: string): Promise<RazorpayOrderResponse> {
    const res = await apiClient.post<{ success: boolean; data: RazorpayOrderResponse }>("/billing/create-order", {
      amount,
      invoiceId
    })
    return res.data
  }

  async verifyPayment(data: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature?: string
    invoiceId?: string
    amount: number
  }): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>("/billing/verify-payment", data)
    return res.data
  }
}

export const billingService = new BillingService()
