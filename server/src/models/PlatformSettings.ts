import mongoose, { Schema, Document } from "mongoose"

export interface IPlatformSettings extends Document {
  platformName: string
  supportEmail: string
  supportPhone: string
  defaultLanguage: string
  availableLanguages: string[]
  platformCommissionPerPatient: number
  currency: string
  requireOrgApproval: boolean
  autoPublishListings: boolean
  notifications: {
    orgSubmitted: boolean
    orgApproved: boolean
    orgRejected: boolean
    orgSuspended: boolean
    paymentReceived: boolean
    emailAlerts: boolean
  }
  security: {
    allowNewRegistrations: boolean
    maintenanceMode: boolean
    sessionTimeoutMinutes: number
  }
  updatedAt: Date
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    platformName: { type: String, default: "MEDIREACH" },
    supportEmail: { type: String, default: "support@medireach.com" },
    supportPhone: { type: String, default: "+91 98765 43210" },
    defaultLanguage: { type: String, default: "English" },
    availableLanguages: { type: [String], default: ["English", "Gujarati", "Hindi"] },
    platformCommissionPerPatient: { type: Number, default: 10 },
    currency: { type: String, default: "INR" },
    requireOrgApproval: { type: Boolean, default: true },
    autoPublishListings: { type: Boolean, default: true },
    notifications: {
      orgSubmitted: { type: Boolean, default: true },
      orgApproved: { type: Boolean, default: true },
      orgRejected: { type: Boolean, default: true },
      orgSuspended: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: true }
    },
    security: {
      allowNewRegistrations: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 60 }
    }
  },
  { timestamps: true }
)

export const PlatformSettings = mongoose.model<IPlatformSettings>("PlatformSettings", PlatformSettingsSchema)
