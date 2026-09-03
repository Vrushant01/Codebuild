import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import { Organization } from "../models/Organization.js"
import { Doctor } from "../models/Doctor.js"
import { Receptionist } from "../models/Receptionist.js"
import { Appointment } from "../models/Appointment.js"
import { Review } from "../models/Review.js"
import { User } from "../models/User.js"
import { authenticateJWT, AuthRequest, optionalAuthenticateJWT } from "../middleware/auth.js"
import { authorizeRoles } from "../middleware/rbac.js"
import { cacheMiddleware, clearCache } from "../middleware/cache.js"

const router = Router()

// Calculate haversine distance in KM
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// GET /api/organizations
router.get("/", cacheMiddleware(30), async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, search, type, specialization, userLat, userLng } = req.query

    const filter: any = { listingStatus: { $in: ["ACTIVE", "APPROVED"] } }

    if (city && typeof city === "string" && city.trim()) {
      filter.city = { $regex: new RegExp(`^${city.trim()}$`, "i") }
    }

    if (type && typeof type === "string") {
      filter.type = type
    }

    if (specialization && typeof specialization === "string") {
      filter.specializations = { $in: [new RegExp(specialization, "i")] }
    }

    if (search && typeof search === "string" && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { address: { $regex: search.trim(), $options: "i" } },
        { specializations: { $in: [new RegExp(search.trim(), "i")] } }
      ]
    }

    let organizations = await Organization.find(filter).lean()

    // Add distance and doctors count
    const orgsWithMetadata = await Promise.all(
      organizations.map(async (org) => {
        let distance: number | undefined
        if (userLat && userLng && org.location?.lat && org.location?.lng) {
          distance = calculateDistanceKm(
            Number(userLat),
            Number(userLng),
            org.location.lat,
            org.location.lng
          )
        }

        const doctors = await Doctor.find({ organizationId: org._id, active: true }).lean()
        const doctorCount = doctors.length
        const specializations = Array.from(new Set(doctors.map(d => d.specialization).concat(org.specializations || [])))

        return {
          ...org,
          id: org._id.toString(),
          distance: distance ? `${distance} km` : "2.5 km",
          distanceNumber: distance ?? 2.5,
          doctorCount,
          specializations,
          available: doctorCount > 0
        }
      })
    )

    // Sort by distance if location provided
    if (userLat && userLng) {
      orgsWithMetadata.sort((a, b) => (a.distanceNumber || 0) - (b.distanceNumber || 0))
    }

    res.status(200).json({
      success: true,
      count: orgsWithMetadata.length,
      data: orgsWithMetadata
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching organizations" })
  }
})

// Helper to resolve the authenticated user's organization
const resolveOrgForUser = async (req: AuthRequest): Promise<any> => {
  const user = req.user!
  let org: any = null
  if (user.role === "ORGANIZATION") {
    org = await Organization.findOne({ $or: [{ userId: user._id }, { "contact.email": user.email }] })
  } else if (user.role === "RECEPTIONIST") {
    const rec = await Receptionist.findOne({ userId: user._id })
    if (rec?.organizationId) org = await Organization.findById(rec.organizationId)
  } else if (user.role === "DOCTOR") {
    const doc = await Doctor.findOne({ userId: user._id })
    if (doc?.organizationId) org = await Organization.findById(doc.organizationId)
  }
  if (!org) {
    org = await Organization.findOne({ listingStatus: { $in: ["ACTIVE", "APPROVED"] } })
  }
  if (!org) {
    org = await Organization.findOne()
  }
  return org
}

// GET /api/organizations/me
router.get("/me", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = await resolveOrgForUser(req)

    if (!org) {
      res.status(404).json({ success: false, message: "No organization found." })
      return
    }

    const doctors = await Doctor.find({ organizationId: org._id, active: true }).populate("userId", "name email phone").lean()
    const receptionists = await Receptionist.find({ organizationId: org._id }).populate("userId", "name email phone").lean()

    res.status(200).json({
      success: true,
      data: {
        ...org.toObject ? org.toObject() : org,
        id: org._id.toString(),
        doctors: doctors.map(d => ({ ...d, id: d._id.toString() })),
        receptionists: receptionists.map(r => ({ ...r, id: r._id.toString() }))
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching organization profile" })
  }
})

// GET /api/organizations/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const org = await Organization.findById(req.params.id).lean()
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found." })
      return
    }

    const doctors = await Doctor.find({ organizationId: org._id, active: true }).populate("userId", "name email phone").lean()
    const receptionists = await Receptionist.find({ organizationId: org._id }).populate("userId", "name email phone").lean()

    res.status(200).json({
      success: true,
      data: {
        ...org,
        id: org._id.toString(),
        doctors: doctors.map(d => ({ ...d, id: d._id.toString() })),
        receptionists: receptionists.map(r => ({ ...r, id: r._id.toString() }))
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching organization details" })
  }
})

// GET /api/organizations/:id/stats
router.get("/:id/stats", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }
    const orgId = org._id

    const todayStr = new Date().toISOString().split("T")[0]

    const totalDoctors = await Doctor.countDocuments({ organizationId: orgId, active: true })
    const totalReceptionists = await Receptionist.countDocuments({ organizationId: orgId, status: "active" })
    const todayAppointments = await Appointment.countDocuments({ organizationId: orgId, date: todayStr })
    const pendingAppointments = await Appointment.countDocuments({ organizationId: orgId, status: "PENDING" })
    const completedAppointments = await Appointment.countDocuments({ organizationId: orgId, status: "COMPLETED" })
    const totalAppointments = await Appointment.countDocuments({ organizationId: orgId })

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalReceptionists,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        totalAppointments,
        occupancyRate: 85,
        rating: org.rating || 4.8
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching organization stats" })
  }
})

// GET /api/organizations/:id/doctors
router.get("/:id/doctors", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }
    const orgId = org._id

    const doctors = await Doctor.find({ organizationId: orgId, active: true }).populate("userId", "name email phone").sort({ createdAt: -1 }).lean()
    const formatted = doctors.map(d => {
      const u = d.userId as any
      return {
        id: d._id.toString(),
        _id: d._id.toString(),
        name: d.name || u?.name || "Doctor",
        specialization: d.specialization,
        qualifications: d.qualifications || ["MBBS"],
        experienceYears: d.experienceYears || 5,
        consultationFee: d.consultationFee || 500,
        telemedicineFee: d.telemedicineFee || 400,
        telemedicineAvailable: d.telemedicineAvailable ?? true,
        email: u?.email || "",
        phone: u?.phone || "",
        rating: d.rating || 4.8,
        reviewCount: d.reviewCount || 0,
        active: d.active ?? true
      }
    })

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching doctors" })
  }
})

// POST /api/organizations/:id/doctors (Add Doctor)
router.post("/:id/doctors", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }
    const orgId = org._id

    const { name, email, phone, password = "password123", specialization, qualifications, experienceYears, consultationFee, telemedicineFee } = req.body

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      role: "DOCTOR",
      accountStatus: "active"
    })

    const doctor = await Doctor.create({
      userId: user._id,
      organizationId: orgId,
      name,
      specialization: specialization || "General Physician",
      qualifications: qualifications ? (Array.isArray(qualifications) ? qualifications : qualifications.split(",")) : ["MBBS"],
      experienceYears: Number(experienceYears) || 5,
      consultationFee: Number(consultationFee) || 500,
      telemedicineFee: Number(telemedicineFee) || 400,
      telemedicineAvailable: true,
      active: true
    })

    // Update organization specializations
    if (specialization) {
      await Organization.findByIdAndUpdate(orgId, { $addToSet: { specializations: specialization } })
    }

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      data: { ...doctor.toObject(), id: doctor._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error creating doctor" })
  }
})

// GET /api/organizations/:id/receptionists
router.get("/:id/receptionists", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }
    const orgId = org._id

    const recs = await Receptionist.find({ organizationId: orgId }).populate("userId", "name email phone").sort({ createdAt: -1 }).lean()
    const formatted = recs.map(r => {
      const u = r.userId as any
      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        name: r.name || u?.name || "Receptionist",
        email: u?.email || r.email || "",
        phone: u?.phone || r.phone || "",
        shift: (r as any).shift || "Morning",
        deskLocation: (r as any).deskLocation || "Main Reception",
        status: r.status || "active"
      }
    })

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching receptionists" })
  }
})

// POST /api/organizations/:id/receptionists (Add Receptionist)
router.post("/:id/receptionists", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }
    const orgId = org._id

    const { name, email, phone, password = "password123", shift = "Morning", deskLocation = "Front Desk" } = req.body

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      role: "RECEPTIONIST",
      accountStatus: "active"
    })

    const receptionist = await Receptionist.create({
      userId: user._id,
      organizationId: orgId,
      name,
      email,
      phone,
      shift,
      deskLocation,
      status: "active"
    })

    res.status(201).json({
      success: true,
      message: "Receptionist added successfully",
      data: { ...receptionist.toObject(), id: receptionist._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error creating receptionist" })
  }
})

// PUT /api/organizations/:id/doctors/:doctorId (Update Doctor)
router.put("/:id/doctors/:doctorId", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, specialization, qualifications, experienceYears, consultationFee, telemedicineFee, active, availability } = req.body
    const updateData: any = {}
    if (name) updateData.name = name
    if (specialization) updateData.specialization = specialization
    if (qualifications) updateData.qualifications = Array.isArray(qualifications) ? qualifications : qualifications.split(",")
    if (experienceYears !== undefined) updateData.experienceYears = Number(experienceYears)
    if (consultationFee !== undefined) updateData.consultationFee = Number(consultationFee)
    if (telemedicineFee !== undefined) updateData.telemedicineFee = Number(telemedicineFee)
    if (active !== undefined) updateData.active = active
    if (availability) updateData.availability = availability

    const doctor = await Doctor.findByIdAndUpdate(req.params.doctorId, updateData, { new: true })
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" })
      return
    }

    if (name && doctor.userId) {
      await User.findByIdAndUpdate(doctor.userId, { name })
    }

    res.status(200).json({ success: true, message: "Doctor updated successfully", data: doctor })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating doctor" })
  }
})

// DELETE /api/organizations/:id/doctors/:doctorId (Remove Doctor)
router.delete("/:id/doctors/:doctorId", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.doctorId)
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" })
      return
    }

    res.status(200).json({ success: true, message: "Doctor removed from organization" })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error removing doctor" })
  }
})

// PUT /api/organizations/:id/receptionists/:recId (Update Receptionist)
router.put("/:id/receptionists/:recId", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, shift, deskLocation, status, permissions } = req.body
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (shift) updateData.shift = shift
    if (deskLocation) updateData.deskLocation = deskLocation
    if (status) updateData.status = status
    if (permissions) updateData.permissions = permissions

    const rec = await Receptionist.findByIdAndUpdate(req.params.recId, updateData, { new: true })
    if (!rec) {
      res.status(404).json({ success: false, message: "Receptionist not found" })
      return
    }

    if (rec.userId) {
      const userUpdate: any = {}
      if (name) userUpdate.name = name
      if (email) userUpdate.email = email
      if (phone) userUpdate.phone = phone
      if (status) userUpdate.accountStatus = status === "inactive" || status === "Suspended" ? "suspended" : "active"
      await User.findByIdAndUpdate(rec.userId, userUpdate)
    }

    res.status(200).json({ success: true, message: "Receptionist updated successfully", data: rec })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating receptionist" })
  }
})

// DELETE /api/organizations/:id/receptionists/:recId (Remove Receptionist)
router.delete("/:id/receptionists/:recId", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rec = await Receptionist.findByIdAndDelete(req.params.recId)
    if (!rec) {
      res.status(404).json({ success: false, message: "Receptionist not found" })
      return
    }

    res.status(200).json({ success: true, message: "Receptionist removed from organization" })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error removing receptionist" })
  }
})

// GET /api/organizations/:id/services
router.get("/:id/services", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let org: any = null
    if (req.params.id === "me") {
      const user = req.user!
      org = await Organization.findOne({ $or: [{ userId: user._id }, { "contact.email": user.email }] })
      if (!org) org = await Organization.findOne({ listingStatus: { $in: ["ACTIVE", "APPROVED"] } })
    } else {
      org = await Organization.findById(req.params.id)
    }

    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    // Initialize default services if none exist
    if (!org.services || org.services.length === 0) {
      org.services = [
        {
          name: "Cardiac ECG & TMT Testing",
          description: "Standard diagnostic cardiac assessment & stress tests.",
          price: 1200,
          status: "Active",
          doctorIds: []
        },
        {
          name: "General Health Checkup",
          description: "Comprehensive outpatient physical screening and vital checks.",
          price: 500,
          status: "Active",
          doctorIds: []
        },
        {
          name: "Pediatric Consultation & Immunization",
          description: "Infant growth tracking and vaccination schedules.",
          price: 600,
          status: "Active",
          doctorIds: []
        }
      ]
      await org.save()
    }

    const formatted = org.services.map((s: any) => ({
      id: s._id ? s._id.toString() : s.id,
      _id: s._id ? s._id.toString() : s.id,
      organizationId: org._id.toString(),
      name: s.name,
      description: s.description || "",
      price: s.price || 500,
      status: s.status || "Active",
      doctorIds: s.doctorIds || []
    }))

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching services" })
  }
})

// POST /api/organizations/:id/services (Add Service)
router.post("/:id/services", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let org: any = null
    if (req.params.id === "me") {
      const user = req.user!
      org = await Organization.findOne({ $or: [{ userId: user._id }, { "contact.email": user.email }] })
      if (!org) org = await Organization.findOne({ listingStatus: { $in: ["ACTIVE", "APPROVED"] } })
    } else {
      org = await Organization.findById(req.params.id)
    }

    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    const { name, description, price = 500, status = "Active", doctorIds = [] } = req.body

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "Service name is required" })
      return
    }

    if (!org.services) org.services = []

    org.services.push({
      name: name.trim(),
      description: description ? description.trim() : "",
      price: Number(price) || 500,
      status: status === "Inactive" ? "Inactive" : "Active",
      doctorIds: Array.isArray(doctorIds) ? doctorIds : []
    })

    await org.save()
    clearCache("organizations")

    const newService = org.services[org.services.length - 1]

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: {
        id: newService._id.toString(),
        _id: newService._id.toString(),
        name: newService.name,
        description: newService.description,
        price: newService.price,
        status: newService.status,
        doctorIds: newService.doctorIds
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error adding service" })
  }
})

// PUT /api/organizations/:id/services/:serviceId (Edit Service)
router.put("/:id/services/:serviceId", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let org: any = null
    if (req.params.id === "me") {
      const user = req.user!
      org = await Organization.findOne({ $or: [{ userId: user._id }, { "contact.email": user.email }] })
      if (!org) org = await Organization.findOne({ listingStatus: { $in: ["ACTIVE", "APPROVED"] } })
    } else {
      org = await Organization.findById(req.params.id)
    }

    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    const service = org.services.id(req.params.serviceId)
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" })
      return
    }

    const { name, description, price, status, doctorIds } = req.body
    if (name) service.name = name.trim()
    if (description !== undefined) service.description = description
    if (price !== undefined) service.price = Number(price)
    if (status) service.status = status
    if (doctorIds !== undefined) service.doctorIds = doctorIds

    await org.save()
    clearCache("organizations")

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: {
        id: service._id.toString(),
        _id: service._id.toString(),
        name: service.name,
        description: service.description,
        price: service.price,
        status: service.status,
        doctorIds: service.doctorIds
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating service" })
  }
})

// PATCH /api/organizations/:id/services/:serviceId/toggle (Disable / Enable Service)
router.patch("/:id/services/:serviceId/toggle", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let org: any = null
    if (req.params.id === "me") {
      const user = req.user!
      org = await Organization.findOne({ $or: [{ userId: user._id }, { "contact.email": user.email }] })
      if (!org) org = await Organization.findOne({ listingStatus: { $in: ["ACTIVE", "APPROVED"] } })
    } else {
      org = await Organization.findById(req.params.id)
    }

    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    const service = org.services.id(req.params.serviceId)
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" })
      return
    }

    service.status = service.status === "Active" ? "Inactive" : "Active"
    await org.save()
    clearCache("organizations")

    res.status(200).json({
      success: true,
      message: `Service marked as ${service.status}`,
      data: {
        id: service._id.toString(),
        _id: service._id.toString(),
        name: service.name,
        status: service.status
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error toggling service status" })
  }
})

// GET /api/organizations/:id/appointments
router.get("/:id/appointments", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    const orgDocs = await Doctor.find({ organizationId: org._id }).select("_id")
    const docIds = orgDocs.map(d => d._id)

    const appointments = await Appointment.find({
      $or: [
        { organizationId: org._id },
        { doctorId: { $in: docIds } }
      ]
    })
      .populate("doctorId")
      .populate("patientUserId")
      .sort({ date: -1, startTime: -1 })
      .lean()

    const formatted = appointments.map((apt: any) => {
      const doc = apt.doctorId as any
      const patUser = apt.patientUserId as any
      return {
        id: apt._id.toString(),
        _id: apt._id.toString(),
        patientId: patUser?._id ? patUser._id.toString() : (apt.patientId ? apt.patientId.toString() : "PAT-01"),
        patientName: apt.patientName || patUser?.name || "Patient",
        patientPhone: apt.patientPhone || patUser?.phone || "",
        doctor: doc ? {
          id: doc._id.toString(),
          _id: doc._id.toString(),
          name: doc.name || "Doctor",
          specialization: doc.specialization || "General"
        } : { id: "doc_1", name: "Doctor", specialization: "General" },
        organization: {
          id: org._id.toString(),
          _id: org._id.toString(),
          name: org.name
        },
        date: apt.date,
        timeStr: apt.timeStr || apt.startTime,
        consultationType: apt.type || apt.consultationType || "Physical",
        appointmentFor: apt.appointmentFor || "Myself",
        status: apt.status,
        attendance: (apt.attendanceStatus === "YES" ? "ATTENDED" : "UNKNOWN"),
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt
      }
    })

    res.status(200).json({ success: true, count: formatted.length, data: formatted })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching organization appointments" })
  }
})

// GET /api/organizations/:id/feedback
router.get("/:id/feedback", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }
    const orgId = org._id

    const reviews = await Review.find({
      $or: [{ organizationId: orgId }, { organization: orgId }]
    }).sort({ createdAt: -1 }).lean()

    res.status(200).json({ success: true, count: reviews.length, data: reviews })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching feedback" })
  }
})

// GET /api/organizations/:id/settings
router.get("/:id/settings", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    const settings = org.settings || {
      newBookingAlerts: true,
      cancellationAlerts: true,
      staffActivity: false,
      appointmentAlerts: true
    }

    res.status(200).json({ success: true, data: settings })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching settings" })
  }
})

// PUT /api/organizations/:id/settings
router.put("/:id/settings", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    const { newBookingAlerts, cancellationAlerts, staffActivity, appointmentAlerts } = req.body
    if (!org.settings) org.settings = {}

    if (newBookingAlerts !== undefined) org.settings.newBookingAlerts = newBookingAlerts
    if (cancellationAlerts !== undefined) org.settings.cancellationAlerts = cancellationAlerts
    if (staffActivity !== undefined) org.settings.staffActivity = staffActivity
    if (appointmentAlerts !== undefined) org.settings.appointmentAlerts = appointmentAlerts

    await org.save()
    clearCache("organizations")

    res.status(200).json({ success: true, message: "Settings saved successfully", data: org.settings })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating settings" })
  }
})

// POST /api/organizations (Admin or Doctor registering clinic)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, city, address, contact, email, phone, password, specializations, receptionistEnabled, telemedicineEnabled, location, lat, lng } = req.body

    if (!name) {
      res.status(400).json({ success: false, message: "Organization name is required." })
      return
    }

    const orgEmail = (email || (typeof contact === "object" ? contact?.email : "") || "").toLowerCase().trim()
    const orgPhone = phone || (typeof contact === "object" ? contact?.phone : typeof contact === "string" ? contact : "") || ""
    const orgPassword = password || "password123"
    const finalLat = Number(location?.lat ?? lat) || 23.0225
    const finalLng = Number(location?.lng ?? lng) || 72.5714

    // 1. Create or find User account for this organization
    let user = null
    if (orgEmail) {
      user = await User.findOne({ email: orgEmail })
    }

    if (!user) {
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(orgPassword, salt)
      user = await User.create({
        name: name.trim(),
        email: orgEmail || undefined,
        phone: orgPhone || undefined,
        passwordHash,
        role: "ORGANIZATION",
        accountStatus: "active"
      })
    } else {
      user.role = "ORGANIZATION"
      user.name = name.trim()
      if (orgPassword) {
        const salt = await bcrypt.genSalt(10)
        user.passwordHash = await bcrypt.hash(orgPassword, salt)
      }
      await user.save()
    }

    // 2. Create Organization record
    const newOrg = await Organization.create({
      userId: user._id,
      name: name.trim(),
      type: type || "Hospital",
      address: address || `${city || "Ahmedabad"} Central Hospital Road`,
      city: city || "Ahmedabad",
      location: {
        lat: finalLat,
        lng: finalLng
      },
      contact: {
        phone: orgPhone,
        email: orgEmail
      },
      listingStatus: "ACTIVE",
      receptionistEnabled: receptionistEnabled ?? true,
      telemedicineEnabled: telemedicineEnabled ?? true,
      rating: 5.0,
      reviewCount: 0,
      specializations: Array.isArray(specializations) && specializations.length > 0 
        ? specializations 
        : ["General Medicine", "Cardiology"],
      services: [
        { name: "General Consultation", description: "Standard clinical evaluation", price: 500, status: "Active" },
        { name: "Emergency Care", description: "Immediate acute assessment", price: 1000, status: "Active" }
      ],
      workingHours: {
        open: "08:00 AM",
        close: "08:00 PM",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      },
      settings: {
        newBookingAlerts: true,
        cancellationAlerts: true,
        staffActivity: false,
        appointmentAlerts: true
      }
    })

    clearCache("organizations")

    res.status(201).json({
      success: true,
      message: "Organization created successfully and credentials activated.",
      data: {
        ...newOrg.toObject(),
        id: newOrg._id.toString(),
        loginEmail: orgEmail,
        loginPassword: orgPassword
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error creating organization" })
  }
})

// PUT /api/organizations/:id
router.put("/:id", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = req.params.id === "me" ? await resolveOrgForUser(req) : await Organization.findById(req.params.id)
    if (!org) {
      res.status(404).json({ success: false, message: "Organization not found" })
      return
    }

    const { name, type, description, address, city, contact, website, location, lat, lng } = req.body
    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (type) updateData.type = type
    if (description !== undefined) updateData.description = description
    if (address) updateData.address = address.trim()
    if (city) updateData.city = city.trim()
    if (website !== undefined) updateData.website = website
    
    if (location) {
      updateData.location = {
        lat: Number(location.lat) || (org.location?.lat ?? 23.0225),
        lng: Number(location.lng) || (org.location?.lng ?? 72.5714)
      }
    } else if (lat !== undefined && lng !== undefined) {
      updateData.location = {
        lat: Number(lat) || 23.0225,
        lng: Number(lng) || 72.5714
      }
    }

    if (contact) {
      if (typeof contact === 'object') {
        updateData.contact = {
          phone: contact.phone || org.contact?.phone || "",
          email: contact.email || org.contact?.email || ""
        }
      } else if (typeof contact === 'string') {
        updateData.contact = {
          phone: contact,
          email: org.contact?.email || ""
        }
      }
    }

    const updated = await Organization.findByIdAndUpdate(org._id, updateData, { new: true })

    // Sync User record if linked
    if (org.userId) {
      const userUpdates: any = {}
      if (name) userUpdates.name = name.trim()
      if (contact && typeof contact === 'object') {
        if (contact.email) userUpdates.email = contact.email.trim().toLowerCase()
        if (contact.phone) userUpdates.phone = contact.phone.trim()
      }
      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(org.userId, userUpdates)
      }
    }

    clearCache("organizations")
    res.status(200).json({ success: true, message: "Organization profile updated successfully", data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating organization" })
  }
})

export default router
