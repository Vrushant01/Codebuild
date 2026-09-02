import React, { createContext, useContext, useState, useEffect } from "react"
import { authService } from "./auth-service"
import type { User, AccountStatus } from "./auth-service"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accountStatus: AccountStatus | null
  login: typeof authService.login
  register: typeof authService.register
  verifyOtp: typeof authService.verifyOtp
  forgotPassword: typeof authService.forgotPassword
  resetPassword: typeof authService.resetPassword
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)

  useEffect(() => {
    // Check initial user session
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      setAccountStatus(currentUser.status)
    }
    setIsLoading(false)
  }, [])

  const login = async (identifier: string, passwordOrOtp: string) => {
    const loggedInUser = await authService.login(identifier, passwordOrOtp)
    setUser(loggedInUser)
    setAccountStatus(loggedInUser.status)
    return loggedInUser
  }

  const register = async (data: any) => {
    const newUser = await authService.register(data)
    setUser(newUser)
    setAccountStatus(newUser.status)
    return newUser
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setAccountStatus(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    accountStatus,
    login,
    register,
    verifyOtp: authService.verifyOtp,
    forgotPassword: authService.forgotPassword,
    resetPassword: authService.resetPassword,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
