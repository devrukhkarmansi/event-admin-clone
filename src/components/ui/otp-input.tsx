"use client"

import React, { useRef, useState } from "react"
import { Input } from "./input"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OTPInput({ length = 6, value, onChange, disabled }: OTPInputProps) {
  const [otp, setOtp] = useState(value.split(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, digit: string) => {
    if (digit.length > 1) return // Prevent multiple digits

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    onChange(newOtp.join(''))

    // Move to next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length)
    const digits = pastedData.split('')
    
    const newOtp = [...otp]
    digits.forEach((digit, index) => {
      if (index < length) newOtp[index] = digit
    })
    
    setOtp(newOtp)
    onChange(newOtp.join(''))
    inputRefs.current[Math.min(digits.length, length - 1)]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, i) => (
        <Input
          key={i}
          ref={(el: HTMLInputElement | null) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={otp[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-lg font-semibold"
        />
      ))}
    </div>
  )
} 