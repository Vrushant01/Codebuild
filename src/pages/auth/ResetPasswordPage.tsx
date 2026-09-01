import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { PasswordField } from "../../components/auth/PasswordField"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../lib/auth/AuthContext"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword(password)
      setIsSuccess(true)
    } catch (err) {
      setError("Failed to reset password. The link might be expired.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been successfully reset."
      >
        <div className="space-y-6">
          <div className="p-4 bg-primary/10 text-primary rounded-lg text-sm text-center">
            ✓ You can now log in with your new password.
          </div>
          <Button className="w-full" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Please enter your new password below."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <PasswordField
          id="new-password"
          label="New password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full mt-6" disabled={isSubmitting || !password}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </AuthLayout>
  )
}
