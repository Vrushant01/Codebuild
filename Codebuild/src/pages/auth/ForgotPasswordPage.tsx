import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../lib/auth/AuthContext"

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { forgotPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await forgotPassword(identifier)
      setIsSuccess(true)
    } catch (err) {
      // Ignore error for security reasons, just show success
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="We've sent recovery instructions to your contact method."
      >
        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg text-sm text-center">
            If an account exists for <strong>{identifier}</strong>, you will receive a password reset link shortly.
          </div>
          
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => navigate("/reset-password")}
          >
            Simulate opening reset link
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Return to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll help you get back into your account."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="identifier" className="text-sm font-medium">Email or Mobile number</label>
          <Input
            id="identifier"
            placeholder="Enter your email or mobile"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || !identifier}>
          {isSubmitting ? "Sending..." : "Continue"}
        </Button>

        <div className="text-center">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
