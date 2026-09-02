import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { OtpInput } from "../../components/auth/OtpInput"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../lib/auth/AuthContext"

export default function VerifyAccountPage() {
  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { verifyOtp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    
    try {
      // Mocking mobile number as it's just a demo page
      await verifyOtp("0000000000", otp)
      navigate("/app/patient")
    } catch (err: any) {
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your account"
      subtitle="We sent a verification code to your email/mobile."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <OtpInput value={otp} onChange={setOtp} length={6} />
          <p className="text-xs text-muted-foreground text-center">
            (Use 123456 for demo)
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || otp.length < 6}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-center text-sm">
          <button type="button" className="font-medium text-primary hover:underline">
            Resend code
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
