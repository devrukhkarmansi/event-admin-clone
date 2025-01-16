'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OTPInput } from "@/components/ui/otp-input"
import { useRequestOtp, useVerifyOtp } from "@/hooks/use-auth"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/hooks/use-toast"

type Channel = 'email' | 'phone'

interface ApiError {
  message: string;
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setTokens } = useAuthStore()
  const requestOtpMutation = useRequestOtp()
  const verifyOtpMutation = useVerifyOtp()
  const [channel, setChannel] = useState<Channel>('email')
  const [recipient, setRecipient] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'organizer') {
        router.push('/dashboard')
      } else {
        toast({
          variant: "destructive",
          title: "Unauthorized access",
          description: "Admin/Organizer only."
        })
        useAuthStore.getState().clearAuth()
      }
    }
  }, [isAuthenticated, user, router, toast])

  const loading = requestOtpMutation.isPending || verifyOtpMutation.isPending

  const requestOtp = async () => {
    try {
      setError("")
      setIsOtpSent(false)
      setOtp("")

      if (!recipient) {
        setError(`Please enter your ${channel === 'email' ? 'email' : 'phone number'}`)
        return
      }

      if (channel === 'phone' && !countryCode) {
        setError("Please enter country code")
        return
      }

      const result = await requestOtpMutation.mutateAsync({ 
        recipient,
        channel,
        ...(channel === 'phone' && { countryCode })
      })

      if (!result) {
        setError("Failed to send OTP")
        return
      }

      setIsOtpSent(true)
      
    } catch (error) {
      const apiError = error as ApiError
      console.error('Request OTP Error:', apiError)
      setError(apiError.message || "Something went wrong")
      setIsOtpSent(false)
      setOtp("")
    }
  }

  const handleOtpChange = (value: string) => {
    setError("")
    setOtp(value)
  }

  const verifyOtp = async () => {
    try {
      setError("")

      if (otp.length < 6) {
        setError("Please enter a valid OTP")
        setOtp("")
        return
      }

      const data = await verifyOtpMutation.mutateAsync({
        recipient,
        code: otp,
        channel,
        ...(channel === 'phone' && { countryCode })
      })

      if (!data || !data.access_token || !data.user) {
        setError("Invalid response from server")
        setOtp("")
        return
      }

      try {
        setTokens(data)
        setUser(data.user)
        router.push("/dashboard")
      } catch (error) {
        console.error('Failed to set auth state:', error)
        setError("Failed to complete login")
        setOtp("")
      }

    } catch (error) {
      const apiError = error as ApiError
      console.error('Verify OTP Error:', apiError)
      setError(apiError.message || "Something went wrong")
      setOtp("")

      if (apiError.message?.includes('attempts remaining')) {
        console.log('Invalid OTP with attempts remaining')
        // Keep showing OTP input
        return
      } else {
        console.log('Invalid OTP with no attempts remaining')
        // If no attempts remaining or other error, go back to request OTP
        setIsOtpSent(false)
      }
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
            
            {(!isOtpSent) ? (
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