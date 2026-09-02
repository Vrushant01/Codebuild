import mongoose, { Schema, Document } from "mongoose"

export interface IDoctorLeadBilling {
  doctorId: mongoose.Types.ObjectId | string
  doctorName: string
  specialization?: string
  patientCount: number
  rate: number
  amount: number
}

export interface IBillingInvoice extends Document {
  organizationId: mongoose.Types.ObjectId
  billingMonth: string // e.g. "2026-09"
  cycleName: string    // e.g. "September 2026"
  ratePerPatient: number
  totalAttendedPatients: number
  totalAmount: number
  doctorBreakdown: IDoctorLeadBilling[]
  status: "UNPAID" | "PENDING" | "PAID"
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DoctorLeadBillingSchema = new Schema<IDoctorLeadBilling>(
  {
    doctorId: { type: Schema.Types.Mixed, required: true },
    doctorName: { type: String, required: true },
    specialization: { type: String, default: "General Medicine" },
    patientCount: { type: Number, default: 0 },
    rate: { type: Number, default: 10 },
    amount: { type: Number, default: 0 }
  },
  { _id: false }
)

const BillingInvoiceSchema = new Schema<IBillingInvoice>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    billingMonth: { type: String, required: true, index: true },
    cycleName: { type: String, required: true },
    ratePerPatient: { type: Number, default: 10 },
    totalAttendedPatients: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    doctorBreakdown: [DoctorLeadBillingSchema],
    status: { type: String, enum: ["UNPAID", "PENDING", "PAID"], default: "UNPAID", index: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date }
  },
  { timestamps: true }
)

export const BillingInvoice = mongoose.model<IBillingInvoice>("BillingInvoice", BillingInvoiceSchema)
