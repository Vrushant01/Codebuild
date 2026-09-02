import mongoose, { Schema, Document } from "mongoose"

export interface ISubscription extends Document {
  organizationId: mongoose.Types.ObjectId
  plan: "Starter" | "Professional" | "Enterprise"
  status: "active" | "pending" | "expired" | "cancelled"
  price: number
  billingCycle: "monthly" | "yearly"
  startDate: string
  endDate: string
  paymentStatus: "paid" | "pending" | "failed"
  features: string[]
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    plan: { type: String, enum: ["Starter", "Professional", "Enterprise"], default: "Professional" },
    status: { type: String, enum: ["active", "pending", "expired", "cancelled"], default: "active" },
    price: { type: Number, default: 2999 },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "paid" },
    features: [{ type: String }]
  },
  { timestamps: true }
)

export const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema)
