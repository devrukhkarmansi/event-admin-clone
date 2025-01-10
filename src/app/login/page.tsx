'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OTPInput } from "@/components/ui/otp-input"
import { useRequestOtp, useVerifyOtp } from "@/lib/queries"
import { useAuthStore } from "@/store/auth-store"
import { setAuthTokens } from "@/lib/auth"

type Channel = 'email' | 'phone'

interface ApiError {
  message: string;
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const requestOtpMutation = useRequestOtp()
  const verifyOtpMutation = useVerifyOtp()
  const [channel, setChannel] = useState<Channel>('email')
  const [recipient, setRecipient] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)

  const loading = requestOtpMutation.isPending || verifyOtpMutation.isPending

  const requestOtp = async () => {
    try {
      await requestOtpMutation.mutateAsync({ 
        recipient,
        channel,
        ...(channel === 'phone' && { countryCode })
      })
      setIsOtpSent(true)
    } catch (error) {
      setError((error as ApiError).message || "Something went wrong")
    }
  }

  const verifyOtp = async () => {
    try {
      const data = await verifyOtpMutation.mutateAsync({
        recipient,
        code: otp,
        channel,
        ...(channel === 'phone' && { countryCode })
      })
      
      setAuthTokens(data)
      setUser(data.user)
      router.push("/dashboard")
    } catch (error) {
      setError((error as ApiError).message || "Something went wrong")
    }
  }

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    setRecipient(e.target.value)
  }

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    setCountryCode(e.target.value)
  }

  const handleOtpChange = (value: string) => {
    setError("")
    setOtp(value)
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
                onChange={handleCountryCodeChange}
                disabled={isOtpSent || loading}
              />
            )}

            <Input
              type={channel === 'email' ? 'email' : 'tel'}
              placeholder={channel === 'email' ? 'Enter your email' : 'Enter your phone'}
              value={recipient}
              onChange={handleRecipientChange}
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
                  onChange={handleOtpChange}
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