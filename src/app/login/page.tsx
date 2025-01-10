'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { clearAuthTokens, setAuthTokens } from "@/lib/auth"
import { config } from "@/config"
import { OTPInput } from "@/components/ui/otp-input"

type Channel = 'email' | 'phone'

interface ApiError {
  message: string;
  statusCode: number;
}

export default function LoginPage() {
  const router = useRouter()
  const [channel, setChannel] = useState<Channel>('email')
  const [recipient, setRecipient] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const requestOtp = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`${config.apiUrl}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recipient,
          channel,
          ...(channel === 'phone' && { countryCode })
        })
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP")
      }
      
      setIsOtpSent(true)
    } catch (err) {
      const error = err as ApiError
      setError(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`${config.apiUrl}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recipient,
          code: otp,
          channel,
          ...(channel === 'phone' && { countryCode })
        })
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP")
      }
      
      clearAuthTokens()
      setAuthTokens(data)
      
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (err) {
      const error = err as ApiError
      setError(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={channel === 'email' ? 'default' : 'outline'}
                onClick={() => setChannel('email')}
                className="flex-1"
                disabled={isOtpSent}
              >
                Email
              </Button>
              <Button
                variant={channel === 'phone' ? 'default' : 'outline'}
                onClick={() => setChannel('phone')}
                className="flex-1"
                disabled={isOtpSent}
              >
                Phone
              </Button>
            </div>

            {channel === 'phone' && (
              <Input
                type="text"
                placeholder="Country Code (e.g. +91)"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={isOtpSent || loading}
              />
            )}

            <Input
              type={channel === 'email' ? 'email' : 'tel'}
              placeholder={channel === 'email' ? 'Enter your email' : 'Enter your phone'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isOtpSent || loading}
            />
            
            {!isOtpSent ? (
              <Button 
                onClick={requestOtp} 
                disabled={!recipient || (channel === 'phone' && !countryCode) || loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Request OTP"}
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Enter the verification code sent to your {channel}
                  </p>
                </div>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                />
                <Button 
                  onClick={verifyOtp} 
                  disabled={otp.length < 6 || loading}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 