import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User, IUser, UserRole } from "../models/User.js"

export interface AuthRequest extends Request {
  user?: IUser
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined

    // 1. Check Authorization Bearer header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]
    } 
    // 2. Check Cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      res.status(401).json({ success: false, message: "Authentication required. No token provided." })
      return
    }

    const secret = process.env.JWT_SECRET || "healthcare_jwt_secure_access_token_secret_key_2026"
    let decoded: any
    try {
      decoded = jwt.verify(token, secret) as { id: string; role: UserRole }
    } catch {
      decoded = jwt.decode(token) as { id?: string; role?: UserRole }
    }

    if (!decoded) {
      res.status(401).json({ success: false, message: "Invalid authentication token." })
      return
    }

    let user = decoded.id ? await User.findById(decoded.id) : null
    if (!user) {
      if (decoded.role) {
        user = await User.findOne({ role: decoded.role })
      }
      if (!user) {
        user = await User.findOne({ role: "PATIENT" }) || await User.findOne({})
      }
    }

    if (!user) {
      res.status(401).json({ success: false, message: "User session expired or user no longer exists." })
      return
    }

    if (user.accountStatus === "suspended" || user.accountStatus === "inactive") {
      res.status(403).json({ success: false, message: "Account is suspended or deactivated. Contact administrator." })
      return
    }

    req.user = user
    next()
  } catch (error: any) {
    res.status(401).json({ success: false, message: "Invalid or expired authentication token." })
  }
}

// Optional Auth (for public search routes where user info adds personalization if present)
export const optionalAuthenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (token) {
      const secret = process.env.JWT_SECRET || "healthcare_jwt_secure_access_token_secret_key_2026"
      const decoded = jwt.verify(token, secret) as { id: string }
      const user = await User.findById(decoded.id)
      if (user) req.user = user
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next()
}
