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
    <div className="flex flex-col min-h-screen bg-[#fdfaf6]">
      <HeaderPage />

      <main className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {/* Warm Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f4a94b]/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-amber-50 rounded-full blur-[150px]"></div>

        <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white shadow-xl border border-amber-100/20">
              <span className="text-4xl font-black tracking-tighter text-primary">
                12<span className="text-secondary">Gaam</span>
              </span>
            </div>
            <p className="text-slate-500 text-lg">Access your community portal</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-2xl border-white shadow-[0_20px_50px_rgba(244,169,75,0.08)] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900 text-center">Admin Login</CardTitle>
              <CardDescription className="text-slate-500 text-center">
                {otpSent ? 'Enter the security code sent to your email.' : 'Admins: Use username and password to login.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-in shake flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-slate-700 font-medium ml-1">Username</Label>
                  <div className="relative group">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-secondary transition-colors" />
                    <Input
                      id="identifier"
                      placeholder="Your community username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value)
                        setOtpSent(false)
                        setOtp('')
                        setOtpMessage('')
                        setPassword('') // Reset password when identifier changes to reset state
                      }}
                      required
                      className="pl-10 h-12 rounded-xl border-amber-100/50 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                      {!password && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors disabled:opacity-50 animate-in fade-in zoom-in duration-300"
                        >
                          {isSendingOtp ? 'Sending...' : 'Login with Email OTP Instead'}
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          // Clear any OTP states if user starts typing password
                          setOtp('')
                          setOtpSent(false)
                          setOtpMessage('')
                        }}
                        placeholder="Enter your security password"
                        className="h-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-secondary transition-all rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="otp" className="text-slate-700 font-medium">Security Code (OTP)</Label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                      >
                        Back to password
                      </button>
                    </div>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-secondary transition-colors" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        className="pl-10 h-12 rounded-xl border-amber-100/50 bg-slate-50/50 focus:bg-white focus:border-secondary transition-all text-center text-xl tracking-[0.5em] font-mono"
                      />
                    </div>
                  </div>
                )}

                {otpMessage && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in scale-in-95">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    {otpMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-lg shadow-xl shadow-secondary/20 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>

                <div className="pt-4 text-center">
                  <p className="text-sm text-slate-500">
                    New to the community?{' '}
                    <Link href="/join#register" className="text-secondary hover:text-secondary/80 font-semibold transition-colors">
                      Register your family
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <FooterPage />

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-in.shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
