import { apiClient } from "../api/apiClient"

export type Role = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "ORGANIZATION"
export type AccountStatus = "active" | "pending" | "suspended" | "inactive"

export interface User {
  id: string
  name: string
  email?: string
  mobile?: string
  phone?: string
  role: Role
  status: AccountStatus
  language?: string
  avatar?: string
  patientId?: string
  doctorId?: string
  organizationId?: string
}

export const authService = {
  async login(identifier: string, passwordOrOtp: string): Promise<User> {
    try {
      const isOtp = passwordOrOtp === "123456" || passwordOrOtp === "000000"
      const res = await apiClient.post<{ success: boolean; token: string; user: any }>("/auth/login", {
        identifier,
        password: isOtp ? undefined : passwordOrOtp,
        otp: isOtp ? passwordOrOtp : undefined
      })

      if (res.token) {
        localStorage.setItem("token", res.token)
      }
      if (res.user) {
        localStorage.setItem("currentUser", JSON.stringify(res.user))
        return res.user
      }
      throw new Error("Invalid response from login server")
    } catch (err: any) {
      throw new Error(err.message || "Failed to log in")
    }
  },

  async register(data: any): Promise<User> {
    try {
      const res = await apiClient.post<{ success: boolean; token: string; user: any }>("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.mobile || data.phone,
        password: data.password || "password123",
        role: data.role || "PATIENT",
        preferredLanguage: data.language || "en"
      })

      if (res.token) {
        localStorage.setItem("token", res.token)
      }
      if (res.user) {
        localStorage.setItem("currentUser", JSON.stringify(res.user))
        return res.user
      }
      throw new Error("Registration response invalid")
    } catch (err: any) {
      throw new Error(err.message || "Registration failed")
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout")
    } catch {}
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
  },

  async verifyOtp(mobile: string, otp: string): Promise<boolean> {
    const res = await apiClient.post<{ success: boolean }>("/auth/verify-otp", { mobile, otp })
    return res.success
  },

  async forgotPassword(identifier: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { identifier })
  },

  async resetPassword(password: string): Promise<void> {
    const user = this.getCurrentUser()
    await apiClient.post("/auth/reset-password", { email: user?.email, newPassword: password })
  },

  getCurrentUser(): User | null {
    const cached = localStorage.getItem("currentUser")
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {
        return null
      }
    }
    return null
  },

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const res = await apiClient.get<{ success: boolean; user: User }>("/auth/me")
      if (res.success && res.user) {
        localStorage.setItem("currentUser", JSON.stringify(res.user))
        return res.user
      }
    } catch {
      return this.getCurrentUser()
    }
    return null
  }
}
