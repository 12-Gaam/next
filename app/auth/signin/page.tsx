'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Mail } from 'lucide-react'

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const router = useRouter()

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!identifier) {
      setError('Please enter your email or username first')
      return
    }

    setIsSendingOtp(true)
    setError('')
    setOtpMessage('')

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier })
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setOtpMessage('OTP has been sent to your email. Please check your inbox.')
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setOtpMessage('')

    // Check if we have either password (for admin) or OTP (for member)
    if (!password && !otp) {
      setError('Please enter password or OTP')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        identifier,
        password: password || undefined,
        otp: otp || undefined,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'PENDING_VERIFICATION') {
          setError('Your registration is awaiting gaam admin approval.')
        } else if (result.error === 'REGISTRATION_REJECTED') {
          setError('Your registration was rejected. Please contact support.')
        } else if (result.error === 'OTP_REQUIRED') {
          setError('Please enter OTP to login. Click "Send OTP" if you haven\'t received it.')
        } else if (result.error === 'INVALID_OTP') {
          setError('Invalid OTP. Please check and try again.')
        } else if (result.error === 'OTP_EXPIRED') {
          setError('OTP has expired. Please request a new OTP.')
          setOtpSent(false)
          setOtp('')
        } else {
          setError('Invalid credentials. Please try again.')
        }
      } else {
        const session = await getSession()
        if (session?.user.role === 'SUPER_ADMIN' || session?.user.role === 'GAAM_ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Access your 12Gaam account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member & Admin Login</CardTitle>
            <CardDescription>
              Members: Use OTP sent to email. Admins: Use username and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    setOtpSent(false)
                    setOtp('')
                    setOtpMessage('')
                  }}
                  placeholder="e.g. me@12gaam.com"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* OTP Section for Members */}
              {otpSent ? (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP (One-Time Password)</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    OTP sent to your email. Valid for 15 minutes.
                  </p>
                </div>
              ) : (
                /* Password Section for Admins */
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              )}

              {/* Send OTP Button for Members */}
              {!otpSent && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || isLoading || !identifier}
                  className="w-full"
                >
                  {isSendingOtp ? (
                    'Sending OTP...'
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send OTP to Email
                    </>
                  )}
                </Button>
              )}

              {otpMessage && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  {otpMessage}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={isLoading || (otpSent ? !otp : !password && !otp)}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need to register your family?{' '}
                <Link href="/join#register" className="text-blue-600 hover:underline">
                  Join the community
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
