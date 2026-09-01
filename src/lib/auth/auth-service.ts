export type Role = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN"
export type AccountStatus = "active" | "pending" | "suspended" | "inactive"

export interface User {
  id: string
  name: string
  email?: string
  mobile?: string
  role: Role
  status: AccountStatus
  language?: string
  avatar?: string
}

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_USERS: Record<string, User> = {
  "patient@medireach.demo": {
    id: "pat_123",
    name: "Alex Johnson",
    email: "patient@medireach.demo",
    role: "PATIENT",
    status: "active",
    language: "en"
  },
  "doctor@medireach.demo": {
    id: "doc_456",
    name: "Dr. Sarah Smith",
    email: "doctor@medireach.demo",
    role: "DOCTOR",
    status: "active",
  },
  "receptionist@medireach.demo": {
    id: "rec_789",
    name: "Emma Davis",
    email: "receptionist@medireach.demo",
    role: "RECEPTIONIST",
    status: "active",
  },
  "admin@medireach.demo": {
    id: "adm_012",
    name: "System Admin",
    email: "admin@medireach.demo",
    role: "ADMIN",
    status: "active",
  }
}

// Temporary in-memory state for mock auth
let currentUser: User | null = null

export const authService = {
  async login(identifier: string, passwordOrOtp: string): Promise<User> {
    await mockDelay(800)
    
    // Simulate valid login if identifier is one of the mock users
    const user = MOCK_USERS[identifier]
    
    // Accept any password/OTP for demo purposes, but require a specific format or non-empty
    if (user && passwordOrOtp.length > 0) {
      currentUser = user
      return user
    }
    
    // Also support mobile login mock
    if (identifier === "9876543210" && passwordOrOtp === "123456") {
      const mobileUser: User = {
        id: "pat_mobile_999",
        name: "Raj Patel",
        mobile: "9876543210",
        role: "PATIENT",
        status: "active",
        language: "gu"
      }
      currentUser = mobileUser
      return mobileUser
    }

    throw new Error("Invalid credentials")
  },

  async register(data: any): Promise<User> {
    await mockDelay(1000)
    
    const newUser: User = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || "New User",
      email: data.email,
      mobile: data.mobile,
      role: "PATIENT",
      status: "active",
      language: data.language || "en"
    }
    
    currentUser = newUser
    return newUser
  },

  async logout(): Promise<void> {
    await mockDelay(400)
    currentUser = null
  },

  async verifyOtp(mobile: string, otp: string): Promise<boolean> {
    await mockDelay(600)
    if (otp === "123456") return true
    throw new Error("Invalid OTP code")
  },

  async forgotPassword(identifier: string): Promise<void> {
    await mockDelay(800)
    // Always succeed for mock
    return
  },

  async resetPassword(password: string): Promise<void> {
    await mockDelay(800)
    return
  },

  getCurrentUser(): User | null {
    return currentUser
  }
}
