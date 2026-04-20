'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Mail, ArrowRight, UserCircle, ShieldCheck, Loader2 } from 'lucide-react'
import HeaderPage from '@/components/common/HeaderPage'
import FooterPage from '@/components/common/FooterPage'

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
    setPassword('') // Mutual exclusivity: clear password if OTP is requested

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
        // setOtpMessage('OTP has been sent to your email. Please check your inbox.')
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
    <div className="min-h-screen bg-white flex flex-col">
      <HeaderPage />

      <main className="flex-1 bg-gradient-to-b from-secondary/10 to-white py-12 flex flex-col items-center justify-center" id="login">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <p className="text-secondary font-semibold uppercase tracking-widest">
              12Gaam Community Access
            </p>
            <h1 className="text-4xl font-bold text-primary mt-4">
              Access your community portal
            </h1>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              Securely access your administrative dashboard to manage the community.
            </p>
          </div>

          <div className="max-w-[500px] mx-auto w-full">
            <div className="bg-white/90 backdrop-blur border border-secondary/20 shadow-xl rounded-3xl overflow-hidden">
              <Card className="border-0 rounded-none shadow-none">
                <CardHeader className="pb-4 pt-8">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
                    <UserCircle className="h-6 w-6 text-primary" />
                    Admin Login
                  </CardTitle>
                  <CardDescription className="text-center">
                    {otpSent ? 'Enter the security code sent to your email.' : 'Admins: Use username and password to login.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Username</Label>
                      <Input
                        id="identifier"
                        placeholder="Your community username"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value)
                          setOtpSent(false)
                          setOtp('')
                          setOtpMessage('')
                          setPassword('')
                        }}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {!otpSent ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password">Password</Label>
                        </div>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              setOtp('')
                              setOtpSent(false)
                              setOtpMessage('')
                            }}
                            placeholder="Enter your security password"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in slide-in-from-top duration-300">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="otp" className="text-secondary font-semibold">Security Code (OTP)</Label>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-xs text-secondary hover:underline"
                          >
                            Back to password
                          </button>
                        </div>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          maxLength={6}
                          className="text-center text-2xl tracking-[0.5em] h-14 border-secondary/30 focus:border-secondary"
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {otpMessage && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-md">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{otpMessage}</span>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 text-lg font-bold shadow-lg transition-all animate-in zoom-in-95 duration-300"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Authenticating...
                        </span>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center pt-2">
                      New to the community?{' '}
                      <Link href="/join#register" className="text-secondary hover:underline">
                        Register your family
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <FooterPage />
    </div>
  )
}
