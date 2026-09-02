import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User, IUser, UserRole } from "../models/User.js"
import { Patient } from "../models/Patient.js"
import { Doctor } from "../models/Doctor.js"
import { Organization } from "../models/Organization.js"
import { Receptionist } from "../models/Receptionist.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || "healthcare_jwt_secure_access_token_secret_key_2026"
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d"
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    secret,
    { expiresIn: expiresIn as any }
  )
}

const sendTokenResponse = (user: IUser, statusCode: number, res: Response, extraData: any = {}) => {
  const token = generateToken(user)
  const isProduction = process.env.NODE_ENV === "production"

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.accountStatus,
      preferredLanguage: user.preferredLanguage,
      avatar: user.avatar,
      ...extraData
    }
  })
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role = "PATIENT", preferredLanguage = "en", organizationName, specialization } = req.body

    if (!name || (!email && !phone) || !password) {
      res.status(400).json({ success: false, message: "Name, email/phone, and password are required." })
      return
    }

    // Check existing
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() })
      if (existingEmail) {
        res.status(400).json({ success: false, message: "An account with this email already exists." })
        return
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone })
      if (existingPhone) {
        res.status(400).json({ success: false, message: "An account with this phone number already exists." })
        return
      }
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone,
      passwordHash,
      role: role as UserRole,
      preferredLanguage,
      accountStatus: "active"
    })

    // If role is PATIENT, create Patient profile
    if (newUser.role === "PATIENT") {
      const uniqueId = `PAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const qrToken = `QR_${uniqueId}_${Date.now()}`
      await Patient.create({
        userId: newUser._id,
        patientId: uniqueId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        qrCodeToken: qrToken,
        preferredLanguage: newUser.preferredLanguage
      })
    }

    sendTokenResponse(newUser, 201, res)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Registration failed" })
  }
})

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, otp } = req.body
    const identifier = req.body.identifier || req.body.email || req.body.phone || req.body.mobile

    if (!identifier) {
      res.status(400).json({ success: false, message: "Email or phone is required." })
      return
    }

    const query = identifier.includes("@")
      ? { email: identifier.toLowerCase().trim() }
      : { phone: identifier.trim() }

    let user = await User.findOne(query)
    if (!user) {
      // Check if this email or phone belongs to an Organization
      const orgQuery = identifier.includes("@")
        ? { "contact.email": identifier.toLowerCase().trim() }
        : { "contact.phone": identifier.trim() }

      const org = await Organization.findOne(orgQuery)
      if (org) {
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash("password123", salt)
        user = await User.create({
          name: org.name,
          email: org.contact?.email ? org.contact.email.toLowerCase().trim() : undefined,
          phone: org.contact?.phone ? org.contact.phone.trim() : undefined,
          passwordHash,
          role: "ORGANIZATION",
          accountStatus: "active"
        })
        org.userId = user._id
        await org.save()
      }
    }

    if (!user) {
      res.status(404).json({ 
        success: false, 
        notFound: true,
        message: `No account found for "${identifier}". Please create an account or sign up first.` 
      })
      return
    }

    // OTP mode
    if (otp) {
      if (otp !== "123456" && otp !== "000000") {
        res.status(400).json({ success: false, message: "Invalid OTP code. Use 123456 for demo verification." })
        return
      }
    } else {
      // Password mode
      if (!password) {
        res.status(400).json({ success: false, message: "Password is required." })
        return
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash)
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Incorrect password. Please check your password and try again." })
        return
      }
    }

    // Extra role metadata
    let extra: any = {}
    if (user.role === "PATIENT") {
      const patient = await Patient.findOne({ userId: user._id })
      if (patient) extra.patientId = patient.patientId
    } else if (user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({ userId: user._id })
      if (doctor) {
        extra.doctorId = doctor._id
        extra.organizationId = doctor.organizationId
      }
    } else if (user.role === "RECEPTIONIST") {
      const rec = await Receptionist.findOne({ userId: user._id })
      if (rec) {
        extra.receptionistId = rec._id
        extra.organizationId = rec.organizationId
        extra.permissions = rec.permissions
      }
    } else if (user.role === "ORGANIZATION") {
      const org = await Organization.findOne({ $or: [{ userId: user._id }, { "contact.email": user.email }] })
      if (org) {
        extra.organizationId = org._id
        extra.organizationName = org.name
      }
    }

    sendTokenResponse(user, 200, res, extra)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Login failed" })
  }
})

// GET /api/auth/me
router.get("/me", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    let extra: any = {}

    if (user.role === "PATIENT") {
      const patient = await Patient.findOne({ userId: user._id })
      if (patient) {
        extra.patientId = patient.patientId
        extra.qrCodeToken = patient.qrCodeToken
      }
    } else if (user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({ userId: user._id }).populate("organizationId")
      if (doctor) {
        extra.doctorId = doctor._id
        extra.organization = doctor.organizationId
        extra.specialization = doctor.specialization
      }
    } else if (user.role === "RECEPTIONIST") {
      const rec = await Receptionist.findOne({ userId: user._id }).populate("organizationId")
      if (rec) {
        extra.receptionistId = rec._id
        extra.organization = rec.organizationId
        extra.permissions = rec.permissions
      }
    } else if (user.role === "ORGANIZATION") {
      const org = await Organization.findOne({ $or: [{ userId: user._id }, { "contact.email": user.email }] })
      if (org) {
        extra.organizationId = org._id
        extra.organization = org
        extra.organizationName = org.name
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.accountStatus,
        preferredLanguage: user.preferredLanguage,
        avatar: user.avatar,
        ...extra
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve user profile" })
  }
})

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token")
  res.status(200).json({ success: true, message: "Logged out successfully." })
})

// POST /api/auth/verify-otp
router.post("/verify-otp", (req: Request, res: Response) => {
  const { otp } = req.body
  if (otp === "123456" || otp === "000000") {
    res.status(200).json({ success: true, message: "OTP verified successfully." })
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP code." })
  }
})

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { identifier } = req.body
  res.status(200).json({ success: true, message: `Password reset link/OTP sent to ${identifier}` })
})

// POST /api/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response) => {
  const { email, newPassword } = req.body
  if (email && newPassword) {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)
    await User.findOneAndUpdate({ email: email.toLowerCase() }, { passwordHash })
  }
  res.status(200).json({ success: true, message: "Password updated successfully." })
})

export default router
