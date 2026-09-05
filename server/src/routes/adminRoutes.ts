import { Router, Response } from "express"
import { Organization } from "../models/Organization.js"
import { Doctor } from "../models/Doctor.js"
import { Patient } from "../models/Patient.js"
import { Receptionist } from "../models/Receptionist.js"
import { Appointment } from "../models/Appointment.js"
import { Subscription } from "../models/Subscription.js"
import { BillingInvoice } from "../models/Billing.js"
import { PlatformSettings } from "../models/PlatformSettings.js"
import { User } from "../models/User.js"
import { Notification } from "../models/Notification.js"
import bcrypt from "bcryptjs"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"
import { authorizeRoles } from "../middleware/rbac.js"
import { clearCache } from "../middleware/cache.js"

const router = Router()

// GET /api/admin/stats
router.get("/stats", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalOrganizations = await Organization.countDocuments()
    const activeOrganizations = await Organization.countDocuments({ listingStatus: { $in: ["ACTIVE", "APPROVED"] } })
    const totalDoctors = await Doctor.countDocuments()
    const totalPatients = await Patient.countDocuments()
    const totalAppointments = await Appointment.countDocuments()
    const activeSubscriptions = await Subscription.countDocuments({ status: "active" })

    res.status(200).json({
      success: true,
      data: {
        totalOrganizations,
        activeOrganizations,
        totalDoctors,
        totalPatients,
        totalAppointments,
        activeSubscriptions,
        platformUptime: "99.98%",
        mrr: activeSubscriptions * 2999
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching admin stats" })
  }
})

// GET /api/admin/organizations
router.get("/organizations", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 }).lean()
    const formatted = await Promise.all(
      orgs.map(async o => {
        const docCount = await Doctor.countDocuments({ organizationId: o._id })
        const recCount = await Receptionist.countDocuments({ organizationId: o._id })
        return {
          ...o,
          id: o._id.toString(),
          doctorsCount: docCount,
          receptionistsCount: recCount
        }
      })
    )
    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching admin organizations" })
  }
})

// PATCH /api/admin/organizations/:id/status (Approve / Suspend / Activate / Reject)
router.patch("/organizations/:id/status", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body // "ACTIVE" | "APPROVED" | "SUSPENDED" | "INACTIVE" | "REJECTED"
    const updated = await Organization.findByIdAndUpdate(req.params.id, { listingStatus: status }, { new: true })
    if (!updated) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    // Determine user status
    let userStatus: "active" | "pending" | "suspended" | "inactive" = "pending"
    if (status === "ACTIVE" || status === "APPROVED") {
      userStatus = "active"
    } else if (status === "SUSPENDED") {
      userStatus = "suspended"
    } else if (status === "REJECTED" || status === "INACTIVE") {
      userStatus = "inactive"
    }

    // Sync linked user account
    if (updated.userId) {
      await User.findByIdAndUpdate(updated.userId, { 
        accountStatus: userStatus,
        role: "ORGANIZATION"
      })

      if (userStatus === "active") {
        await Notification.create({
          userId: updated.userId,
          type: "organization_approval",
          title: "Organization Approved!",
          message: `Congratulations! ${updated.name} has been approved by the platform Admin. Your facility is now live on the map and you can manage your operations.`,
          actionUrl: `/app/organization`
        })
      }
    } else if (updated.contact?.email) {
      const foundUser = await User.findOne({ email: updated.contact.email.toLowerCase().trim() })
      if (foundUser) {
        foundUser.accountStatus = userStatus
        foundUser.role = "ORGANIZATION"
        await foundUser.save()
        updated.userId = foundUser._id
        await updated.save()
      }
    }

    clearCache("organization")
    clearCache("organizations")

    res.status(200).json({ 
      success: true, 
      message: `Organization status updated to ${status}. User account set to ${userStatus}.`, 
      data: updated 
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating organization status" })
  }
})

// GET /api/admin/doctors
router.get("/doctors", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctors = await Doctor.find().populate("organizationId", "name city").populate("userId", "name email phone").sort({ createdAt: -1 }).lean()
    const formatted = doctors.map(d => {
      const u = d.userId as any
      const org = d.organizationId as any
      return {
        id: d._id.toString(),
        _id: d._id.toString(),
        name: d.name || u?.name || "Doctor",
        specialization: d.specialization,
        experienceYears: d.experienceYears,
        organizationId: org?.name || "Clinic",
        organizationName: org?.name || "Clinic",
        email: u?.email || "",
        phone: u?.phone || "",
        rating: d.rating,
        reviewCount: d.reviewCount
      }
    })
    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching admin doctors" })
  }
})

// GET /api/admin/receptionists
router.get("/receptionists", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const receptionists = await Receptionist.find().populate("organizationId", "name city").populate("userId", "name email phone").sort({ createdAt: -1 }).lean()
    const formatted = receptionists.map(r => {
      const u = r.userId as any
      const org = r.organizationId as any
      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        name: r.name || u?.name || "Receptionist",
        email: u?.email || r.email || "",
        phone: u?.phone || r.phone || "",
        organizationId: org?.name || "Clinic",
        organizationName: org?.name || "Clinic",
        status: r.status || "Active"
      }
    })
    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching admin receptionists" })
  }
})

// GET /api/admin/patients
router.get("/patients", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patients = await Patient.find().populate("userId", "name email phone").sort({ createdAt: -1 }).lean()
    const formatted = patients.map(p => {
      const u = p.userId as any
      return {
        id: p._id.toString(),
        _id: p._id.toString(),
        patientId: p.patientId,
        name: u?.name || "Patient",
        email: u?.email || "",
        phone: u?.phone || "",
        gender: p.gender,
        age: (p as any).age,
        bloodGroup: p.bloodGroup,
        emergencyContact: p.emergencyContact,
        createdAt: p.createdAt
      }
    })
    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching admin patients" })
  }
})

// GET /api/admin/subscriptions
router.get("/subscriptions", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 }).lean()
    const invoices = await BillingInvoice.find().populate("organizationId", "name city type").sort({ createdAt: -1 }).lean()

    const RATE_PER_PATIENT = 10
    const list = []

    for (const org of orgs) {
      const orgInvoices = invoices.filter(i => (i.organizationId as any)?._id?.toString() === org._id.toString() || (i.organizationId as any)?.toString() === org._id.toString())
      const paidInvoices = orgInvoices.filter(i => i.status === "PAID")
      const totalPaidAmount = paidInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0)

      const orgDoctors = await Doctor.find({
        $or: [{ organizationId: org._id }, { organization: org._id }]
      }).lean()

      const docIds = orgDoctors.map(d => d._id)
      const docUserIds = orgDoctors.map(d => (d as any).userId).filter(Boolean)
      const allMatchingIds = [...docIds, ...docUserIds]

      const realAttendedCount = await Appointment.countDocuments({
        $or: [
          { organizationId: org._id },
          { doctorId: { $in: allMatchingIds } },
          { doctor: { $in: docIds } }
        ],
        status: { $in: ["COMPLETED", "CONFIRMED", "ACCEPTED", "completed", "confirmed", "accepted"] }
      })

      const grossAmount = realAttendedCount * RATE_PER_PATIENT
      const outstandingDue = Math.max(0, grossAmount - totalPaidAmount)
      const status = outstandingDue === 0 ? "PAID" : "UNPAID"

      list.push({
        id: org._id.toString(),
        organizationId: org._id.toString(),
        organizationName: org.name,
        city: org.city,
        type: org.type,
        plan: "Pay-per-Patient Lead (₹10/pt)",
        doctorCount: orgDoctors.length,
        totalPatients: realAttendedCount,
        ratePerPatient: RATE_PER_PATIENT,
        totalAmount: grossAmount,
        paidAmount: totalPaidAmount,
        outstandingDue,
        status,
        renewalDate: new Date(Date.now() + 30 * 86400000).toISOString()
      })
    }

    res.status(200).json({ success: true, count: list.length, data: list })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching admin subscriptions" })
  }
})

// POST /api/admin/subscriptions
router.post("/subscriptions", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newSub = await Subscription.create(req.body)
    res.status(201).json({ success: true, data: newSub })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error creating subscription" })
  }
})

// GET /api/admin/settings
router.get("/settings", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await PlatformSettings.findOne()
    if (!settings) {
      settings = await PlatformSettings.create({
        platformName: "MEDIREACH",
        supportEmail: "support@medireach.com",
        supportPhone: "+91 98765 43210",
        defaultLanguage: "English",
        availableLanguages: ["English", "Gujarati", "Hindi"],
        platformCommissionPerPatient: 10,
        currency: "INR",
        requireOrgApproval: true,
        autoPublishListings: true,
        notifications: {
          orgSubmitted: true,
          orgApproved: true,
          orgRejected: true,
          orgSuspended: true,
          paymentReceived: true,
          emailAlerts: true
        },
        security: {
          allowNewRegistrations: true,
          maintenanceMode: false,
          sessionTimeoutMinutes: 60
        }
      })
    }
    res.status(200).json({ success: true, data: settings })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching platform settings" })
  }
})

// PUT /api/admin/settings
router.put("/settings", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await PlatformSettings.findOne()
    if (!settings) {
      settings = new PlatformSettings(req.body)
    } else {
      Object.assign(settings, req.body)
    }
    await settings.save()
    res.status(200).json({ success: true, message: "Platform settings updated successfully", data: settings })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating platform settings" })
  }
})

// POST /api/admin/settings/change-password
router.post("/settings/change-password", authenticateJWT, authorizeRoles("ADMIN"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Current and new password are required." })
      return
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: "New password must be at least 6 characters." })
      return
    }

    const userId = req.user?._id
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: "Admin user not found." })
      return
    }

    const isMatch = await bcrypt.compare(currentPassword, (user as any).password)
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Incorrect current password." })
      return
    }

    const salt = await bcrypt.genSalt(10)
    ;(user as any).password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.status(200).json({ success: true, message: "Admin password changed successfully." })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error changing password" })
  }
})

export default router
