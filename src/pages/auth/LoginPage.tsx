import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { PasswordField } from "../../components/auth/PasswordField"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { useAuth } from "../../lib/auth/AuthContext"

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const user = await login(identifier, password)
      
      // Route based on role
      if (user.role === "PATIENT") {
        navigate("/app/patient")
      } else if (user.role === "DOCTOR") {
        navigate("/app/doctor")
      } else if (user.role === "RECEPTIONIST") {
        navigate("/app/receptionist")
      } else if (user.role === "ADMIN") {
        navigate("/app/admin")
      } else {
        navigate("/app")
      }
    } catch (err: any) {
      setError("We couldn't sign you in. Check your credentials and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue your healthcare journey with Medireach."
    >
      <Tabs value={authMethod} onValueChange={(v) => {
        setAuthMethod(v as "email" | "mobile")
        setError("")
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
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <PasswordField
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                onChange={(e) => setIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                required
                autoComplete="tel"
                maxLength={10}
              />
            </div>
            <PasswordField
              id="mobile-password"
              label="Password / OTP"
              placeholder="Enter password or OTP"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </TabsContent>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </div>
          
          {/* Development Mock Users Helper */}
          {import.meta.env.DEV && (
             <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground">
               <p className="font-bold mb-2">Dev Mock Accounts:</p>
               <ul className="space-y-1">
                 <li><button type="button" onClick={() => { setAuthMethod('email'); setIdentifier('patient@medireach.demo'); setPassword('password'); }} className="hover:text-primary">patient@medireach.demo (Patient)</button></li>
                 <li><button type="button" onClick={() => { setAuthMethod('email'); setIdentifier('doctor@medireach.demo'); setPassword('password'); }} className="hover:text-primary">doctor@medireach.demo (Doctor)</button></li>
                 <li><button type="button" onClick={() => { setAuthMethod('email'); setIdentifier('receptionist@medireach.demo'); setPassword('password'); }} className="hover:text-primary">receptionist@medireach.demo (Receptionist)</button></li>
                 <li><button type="button" onClick={() => { setAuthMethod('email'); setIdentifier('admin@medireach.demo'); setPassword('password'); }} className="hover:text-primary">admin@medireach.demo (Platform Admin)</button></li>
               </ul>
             </div>
          )}
        </form>
      </Tabs>
    </AuthLayout>
  )
}
