import React, { useState, useRef, useEffect } from "react"
import { Input } from "../ui/input"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export function OtpInput({ length = 6, value, onChange, error }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const newOtp = value.split("").slice(0, length)
    setOtp(Array(length).fill("").map((_, i) => newOtp[i] || ""))
  }, [value, length])

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    if (/[^0-9]/.test(val)) return // Only numbers

    const newOtp = [...otp]
    newOtp[index] = val.substring(val.length - 1)
    
    const combined = newOtp.join("")
    onChange(combined)

    if (val && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").slice(0, length)
    if (pastedData) {
      const newOtp = Array(length).fill("")
      pastedData.split("").forEach((char, i) => {
        newOtp[i] = char
      })
      onChange(pastedData)
      if (pastedData.length < length) {
        focusInput(pastedData.length)
      } else {
        inputRefs.current[length - 1]?.focus()
      }
    }
  }

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{1}"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => { inputRefs.current[index] = el }}
          className={`w-12 h-14 text-center text-lg sm:text-xl font-bold bg-muted/50 ${
            error ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
