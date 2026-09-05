import React, { useState } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { PasswordField } from "../../components/auth/PasswordField"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { useAuth } from "../../lib/auth/AuthContext"
import { AlertCircle, UserPlus, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const defaultMethod = searchParams.get("method") === "mobile" ? "mobile" : "email"
  const defaultIdentifier = searchParams.get("identifier") || ""

  const [authMethod, setAuthMethod] = useState<"email" | "mobile">(defaultMethod)
  const [identifier, setIdentifier] = useState(defaultIdentifier)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isUnregistered, setIsUnregistered] = useState(false)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsUnregistered(false)
    setIsPendingApproval(false)
    setIsSubmitting(true)

    try {
      const user = await login(identifier.trim(), password)
      
      // Route based on role
      if (user.role === "PATIENT") {
        navigate("/app/patient")
      } else if (user.role === "DOCTOR") {
        navigate("/app/doctor")
      } else if (user.role === "RECEPTIONIST") {
        navigate("/app/receptionist")
      } else if (user.role === "ORGANIZATION") {
        navigate("/app/organization")
      } else if (user.role === "ADMIN") {
        navigate("/admin")
      } else {
        navigate("/app")
      }
    } catch (err: any) {
      const rawMsg = err.message || ""
      const isPending = rawMsg.toLowerCase().includes("pending") || rawMsg.toLowerCase().includes("under review") || err.pendingApproval
      const isNotFound = rawMsg.toLowerCase().includes("no account") || 
                         rawMsg.toLowerCase().includes("not found") || 
                         rawMsg.toLowerCase().includes("sign up") ||
                         rawMsg.toLowerCase().includes("register") ||
                         err.status === 404

      if (isPending) {
        setIsPendingApproval(true)
        setError(rawMsg || "Your organization registration request is currently under review by Admin. You will be able to log in once accepted.")
      } else if (isNotFound) {
        setIsUnregistered(true)
        setError(rawMsg || `No account found for "${identifier}". Please create an account or sign up first.`)
      } else if (rawMsg.toLowerCase().includes("password")) {
        setError(rawMsg || "Incorrect password. Please verify your password and try again.")
      } else if (rawMsg.toLowerCase().includes("otp")) {
        setError(rawMsg || "Invalid OTP code. Please enter 123456 for demo login.")
      } else {
        setError(rawMsg || "We couldn't sign you in. Check your credentials and try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickLogin = (email: string, rolePassword = "password123") => {
    setAuthMethod("email")
    setIdentifier(email)
    setPassword(rolePassword)
    setError("")
    setIsUnregistered(false)
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue your healthcare journey with Medireach."
    >
      <Tabs value={authMethod} onValueChange={(v) => {
        setAuthMethod(v as "email" | "mobile")
        setError("")
        setIsUnregistered(false)
        setIdentifier("")
        setPassword("")
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TabsContent value="email" className="space-y-4 mt-0">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email address</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  setError("")
                  setIsUnregistered(false)
                }}
                required
                autoComplete="email"
              />
            </div>
            <PasswordField
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              required
              autoComplete="current-password"
            />
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4 mt-0">
            <div className="space-y-2">
              <label htmlFor="mobile" className="text-sm font-medium">Mobile number</label>
              <Input
                id="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value.replace(/[^0-9]/g, ''))
                  setError("")
                  setIsUnregistered(false)
                }}
                required
                autoComplete="tel"
                maxLength={10}
              />
            </div>
            <PasswordField
              id="mobile-password"
              label="Password / OTP"
              placeholder="Enter password (password123) or OTP (123456)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              required
            />
          </TabsContent>

          {/* User-Friendly Error Feedback Banner */}
          {error && (
            <div className={`p-4 text-sm rounded-2xl border space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200 ${
              isPendingApproval
                ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${isPendingApproval ? "text-amber-600 dark:text-amber-400" : "text-destructive"}`} />
                <div className="space-y-1">
                  <span className="leading-snug font-medium">{error}</span>
                  {isPendingApproval && (
                    <p className="text-xs text-muted-foreground pt-1">
                      Our Admin team verifies all healthcare organizations to ensure platform safety. You will be able to sign in as soon as your facility is accepted.
                    </p>
                  )}
                </div>
              </div>
              
              {isUnregistered && (
                <div className="pt-1 border-t border-destructive/15 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Don't have an account yet?</span>
                  <Link 
                    to={`/register?${authMethod === 'email' ? `email=${encodeURIComponent(identifier)}` : `mobile=${encodeURIComponent(identifier)}`}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Sign up now
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </div>
          
          {/* Development Mock Users Helper */}
          {import.meta.env.DEV && (
             <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground">
               <p className="font-bold mb-2">⚡ Quick Dev Logins (Click to autofill):</p>
               <ul className="space-y-1.5">
                 <li><button type="button" onClick={() => handleQuickLogin('doctor@medireach.demo')} className="hover:text-primary underline text-left">doctor@medireach.demo (Doctor - Cardiology)</button></li>
                 <li><button type="button" onClick={() => handleQuickLogin('aarav.patel@medireach.demo')} className="hover:text-primary underline text-left">aarav.patel@medireach.demo (Doctor - Gujarati)</button></li>
                 <li><button type="button" onClick={() => handleQuickLogin('receptionist@medireach.demo')} className="hover:text-primary underline text-left">receptionist@medireach.demo (Receptionist)</button></li>
                 <li><button type="button" onClick={() => handleQuickLogin('info@ahmedabadhospital.org')} className="hover:text-primary underline text-left">info@ahmedabadhospital.org (Organization / Hospital)</button></li>
                 <li><button type="button" onClick={() => handleQuickLogin('contact@apollocarebodakdev.com')} className="hover:text-primary underline text-left">contact@apollocarebodakdev.com (Organization / Clinic)</button></li>
                 <li><button type="button" onClick={() => handleQuickLogin('admin@medireach.demo')} className="hover:text-primary underline text-left">admin@medireach.demo (Platform Admin)</button></li>
               </ul>
             </div>
          )}
        </form>
      </Tabs>
    </AuthLayout>
  )
}
