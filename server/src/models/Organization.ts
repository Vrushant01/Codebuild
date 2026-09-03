import mongoose, { Schema, Document } from "mongoose"

export interface IOrgService {
  _id?: mongoose.Types.ObjectId
  id?: string
  name: string
  description?: string
  price?: number
  status: "Active" | "Inactive"
  doctorIds?: string[]
}

export interface IOrgSettings {
  newBookingAlerts?: boolean
  cancellationAlerts?: boolean
  staffActivity?: boolean
  appointmentAlerts?: boolean
}

export interface IOrganization extends Document {
  userId?: mongoose.Types.ObjectId
  name: string
  type: "Hospital" | "Clinic" | "Healthcare Center" | "Specialty Clinic"
  address: string
  city: string
  state?: string
  pincode?: string
  location: {
    lat: number
    lng: number
  }
  contact: {
    phone: string
    email?: string
    website?: string
  }
  receptionistEnabled: boolean
  telemedicineEnabled: boolean
  listingStatus: "PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "INACTIVE" | "REJECTED" | string
  rating: number
  reviewCount: number
  imageUrl?: string
  workingHours: {
    open: string
    close: string
    days: string[]
  }
  specializations: string[]
  services?: IOrgService[]
  settings?: IOrgSettings
  createdAt: Date
  updatedAt: Date
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    settings: {
      newBookingAlerts: { type: Boolean, default: true },
      cancellationAlerts: { type: Boolean, default: true },
      staffActivity: { type: Boolean, default: false },
      appointmentAlerts: { type: Boolean, default: true }
    },
    name: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      enum: ["Hospital", "Clinic", "Healthcare Center", "Specialty Clinic"], 
      default: "Hospital" 
    },
    services: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, default: 500 },
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        doctorIds: [{ type: String }]
      }
    ],
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, default: "Gujarat" },
    pincode: { type: String },
    location: {
      lat: { type: Number, default: 23.0225 },
      lng: { type: Number, default: 72.5714 }
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String },
      website: { type: String }
    },
    receptionistEnabled: { type: Boolean, default: true },
    telemedicineEnabled: { type: Boolean, default: true },
    listingStatus: { 
      type: String, 
      enum: ["PENDING", "APPROVED", "ACTIVE", "SUSPENDED", "INACTIVE", "REJECTED"], 
      default: "ACTIVE",
      index: true 
    },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    imageUrl: { type: String },
    workingHours: {
      open: { type: String, default: "09:00 AM" },
      close: { type: String, default: "08:00 PM" },
      days: [{ type: String, default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] }]
    },
    specializations: [{ type: String }]
  },
  { timestamps: true }
)

// Geo index if needed, or query by lat/lng
OrganizationSchema.index({ "location.lat": 1, "location.lng": 1 })

export const Organization = mongoose.model<IOrganization>("Organization", OrganizationSchema)
