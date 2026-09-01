import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { PasswordField } from "../../components/auth/PasswordField"
import { OtpInput } from "../../components/auth/OtpInput"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { useAuth } from "../../lib/auth/AuthContext"

export default function RegisterPage() {
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email")
  
  // Common
  const [fullName, setFullName] = useState("")
  const [language, setLanguage] = useState("en")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Email specific
  const [email, setEmail] = useState("")
  
  // Mobile specific
  const [mobile, setMobile] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      localStorage.removeItem("medireach_language")
      localStorage.removeItem("medireach_location")
      await register({ name: fullName, email, language, password })
      navigate("/onboarding/language") // Direct to onboarding after reg
    } catch (err: any) {
      setError("Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!otpSent) {
      // Simulate sending OTP
      setIsSubmitting(true)
      setTimeout(() => {
        setOtpSent(true)
        setIsSubmitting(false)
      }, 1000)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      localStorage.removeItem("medireach_language")
      localStorage.removeItem("medireach_location")
      await verifyOtp(mobile, otp)
      await register({ name: fullName, mobile, language, password })
      navigate("/onboarding/language")
    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your Medireach account"
      subtitle="One account for your healthcare journey."
    >
      <Tabs value={authMethod} onValueChange={(v) => {
        setAuthMethod(v as "email" | "mobile")
        setError("")
        setOtpSent(false)
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="email" disabled={otpSent}>Email</TabsTrigger>
          <TabsTrigger value="mobile" disabled={otpSent}>Mobile</TabsTrigger>
        </TabsList>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        {/* EMAIL REGISTRATION */}
        <TabsContent value="email" className="mt-0">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Full name</label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium">Email address</label>
              <Input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <PasswordField
              id="reg-password"
              label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <PasswordField
              id="confirm-password"
              label="Confirm password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">Preferred Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="en">English (English interface)</option>
                <option value="gu">ગુજરાતી (ગુજરાતી interface)</option>
                <option value="hi">हिन्दी (हिन्दी interface)</option>
              </select>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              By creating an account, you agree to the Terms and Privacy Policy.
            </p>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </TabsContent>

        {/* MOBILE REGISTRATION */}
        <TabsContent value="mobile" className="mt-0">
          <form onSubmit={handleMobileSubmit} className="space-y-4">
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="mobileName" className="text-sm font-medium">Full name</label>
                  <Input
                    id="mobileName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reg-mobile" className="text-sm font-medium">Mobile number</label>
                  <Input
                    id="reg-mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={10}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobile-language" className="text-sm font-medium">Preferred Language</label>
                  <select
                    id="mobile-language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="en">English</option>
                    <option value="gu">ગુજરાતી</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isSubmitting || mobile.length < 10}>
                  {isSubmitting ? "Sending OTP..." : "Continue"}
                </Button>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verify your mobile</label>
                  <p className="text-sm text-muted-foreground">
                    We sent a verification code to +91 {mobile}
                  </p>
                  <div className="pt-2">
                    <OtpInput value={otp} onChange={setOtp} length={6} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    (Use 123456 for demo)
                  </p>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">Create your credentials</h4>
                  <PasswordField
                    id="mobile-reg-password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                  <PasswordField
                    id="mobile-confirm-password"
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || otp.length < 6}>
                  {isSubmitting ? "Verifying..." : "Verify & Create Account"}
                </Button>
                
                <div className="text-center">
                  <button 
                    type="button" 
                    className="text-sm text-primary hover:underline"
                    onClick={() => setOtpSent(false)}
                  >
                    Change mobile number
                  </button>
                </div>
              </div>
            )}
          </form>
        </TabsContent>

        <div className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login here
          </Link>
        </div>
      </Tabs>
    </AuthLayout>
  )
}
