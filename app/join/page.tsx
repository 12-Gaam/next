'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import HeaderPage from '@/components/common/HeaderPage'
import FooterPage from '@/components/common/FooterPage'
import { AlertCircle, CheckCircle2, Loader2, LogIn, Mail, UserPlus2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Gaam {
  id: string
  name: string
}

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gaams, setGaams] = useState<Gaam[]>([])
  const [isLoadingGaams, setIsLoadingGaams] = useState(true)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [gaamId, setGaamId] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registrationError, setRegistrationError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [showGaamList, setShowGaamList] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)

  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason === 'login') {
      setLoginError('Please sign in to continue.')
    }
  }, [searchParams])

  useEffect(() => {
    const fetchGaams = async () => {
      try {
        setIsLoadingGaams(true)
        const response = await fetch('/api/gaams')
        const data = await response.json()
        const list = Array.isArray(data) ? data : Array.isArray(data?.gaams) ? data.gaams : []
        setGaams(list)
      } catch (error) {
        console.error('Failed to fetch gaams', error)
        setGaams([])
      } finally {
        setIsLoadingGaams(false)
      }
    }

    fetchGaams()
  }, [])

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!identifier) {
      setLoginError('Please enter your email or username first')
      return
    }

    setIsSendingOtp(true)
    setLoginError('')
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
        setLoginError(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      setLoginError('Failed to send OTP. Please try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setOtpMessage('')
    setIsLoggingIn(true)

    // Check if we have either password (for admin) or OTP (for member)
    if (!password && !otp) {
      setLoginError('Please enter password or OTP')
      setIsLoggingIn(false)
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
          setLoginError('Your registration is awaiting gaam admin approval.')
        } else if (result.error === 'REGISTRATION_REJECTED') {
          setLoginError('Your registration was rejected. Please contact support.')
        } else if (result.error === 'OTP_REQUIRED') {
          setLoginError('Please enter OTP to login. Click "Send OTP" if you haven\'t received it.')
        } else if (result.error === 'INVALID_OTP') {
          setLoginError('Invalid OTP. Please check and try again.')
        } else if (result.error === 'OTP_EXPIRED') {
          setLoginError('OTP has expired. Please request a new OTP.')
          setOtpSent(false)
          setOtp('')
        } else {
          setLoginError('Invalid credentials. Please try again.')
        }
      } else {
        // Successful login - redirect immediately for better UX
        // Use hard redirect to ensure session is available on next page
        // Dashboard will handle role-based redirects
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setLoginError('Unable to sign in. Please try again later.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistrationError('')
    setRegistrationMessage('')
    setIsRegistering(true)

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          gaamId
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setRegistrationMessage(
        'Registration submitted! Your gaam admin will verify your details. You will receive your login credentials via email once approved.'
      )
      setFullName('')
      setEmail('')
      setGaamId('')
    } catch (error) {
      setRegistrationError(
        error instanceof Error ? error.message : 'Unable to submit registration.'
      )
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <HeaderPage />
      <main className="flex-1 bg-gradient-to-b from-secondary/10 to-white py-12" id="login">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-secondary font-semibold uppercase tracking-widest">
              12Gaam Community Access
            </p>
            <h1 className="text-4xl font-bold text-primary mt-4">
              Register your family or access your dashboard
            </h1>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              Every member begins with a registration. Once your gaam admin verifies your
              details, you&rsquo;ll receive confirmation to manage your entire family profile.
            </p>
          </div>

          <div className="max-w-[500px] mx-auto w-full" id="register">
            <div className="bg-white/90 backdrop-blur border border-secondary/20 shadow-xl rounded-3xl overflow-hidden">
              <div className="grid grid-cols-2 text-center text-sm font-semibold p-4">
                <button
                  type="button"
                  className={`py-4 transition ${activeTab === 'login'
                    ? 'bg-secondary text-primary shadow-inner rounded-full'
                    : ' text-dark rounded-full'
                    }`}
                  onClick={() => setActiveTab('login')}
                >
                  Existing Member Login
                </button>
                <button
                  type="button"
                  className={`py-4 transition ${activeTab === 'register'
                    ? 'bg-secondary text-primary shadow-inner rounded-full'
                    : 'text-dark rounded-full'
                    }`}
                  onClick={() => setActiveTab('register')}
                >
                  New Family Registration
                </button>
              </div>

              <Card className="border-0 rounded-none shadow-none">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                    {activeTab === 'login' ? (
                      <LogIn className="text-primary h-5 w-5" />
                    ) : (
                      <UserPlus2 className="text-secondary h-5 w-5" />
                    )}
                    {activeTab === 'login' ? 'Existing Member Login' : 'New Family Registration'}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'login'
                      ? 'Access your dashboard using OTP.'
                      : 'Register your family. Login details will be shared after approval.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 sm:pt-2">
                  {activeTab === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email or Username</Label>
                        <Input
                          value={identifier}
                          onChange={(e) => {
                            setIdentifier(e.target.value)
                            setOtpSent(false)
                            setOtp('')
                            setOtpMessage('')
                          }}
                          placeholder="Please enter your email or username"
                          required
                          disabled={isLoggingIn}
                        />
                      </div>

                      {/* OTP Section for Members */}
                      {otpSent ? (
                        <div className="space-y-4 animate-in slide-in-from-top duration-300">
                          <div className="space-y-2">
                            <Label className="text-secondary font-semibold">OTP</Label>
                            <Input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit OTP"
                              className="text-center text-2xl tracking-[0.5em] h-14 border-secondary/30 focus:border-secondary"
                              maxLength={6}
                              disabled={isLoggingIn}
                            />
                            <p className="text-xs text-gray-500">
                              OTP sent to your email. Valid for 15 minutes.
                            </p>
                          </div>
                        </div>
                      ) : showPasswordField ? (
                        /* Password Section for Admins */
                        <div className="space-y-2 animate-in slide-in-from-top duration-300">
                          <div className="flex justify-between items-center">
                            <Label>Password</Label>
                            <button
                              type="button"
                              onClick={() => setShowPasswordField(false)}
                              className="text-xs text-secondary hover:underline"
                            >
                              Use OTP instead
                            </button>
                          </div>
                          <Input
                            type="password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              setOtp('')
                              setOtpSent(false)
                              setOtpMessage('')
                            }}
                            placeholder="Enter your password"
                            disabled={isLoggingIn}
                          />
                        </div>
                      ) : null}

                      {/* Send OTP Button for Members (only if not sent and no password typed/shown) */}
                      {!otpSent && !showPasswordField && (
                        <div className="space-y-4">
                          <Button
                            type="button"
                            variant="default"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || isLoggingIn || !identifier}
                            className="w-full bg-secondary hover:bg-secondary/90 text-primary font-semibold h-12 shadow-md transition-all active:scale-95"
                          >
                            {isSendingOtp ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending OTP...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Send OTP to Email
                              </span>
                            )}
                          </Button>

                        </div>
                      )}

                      {otpMessage && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-md">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{otpMessage}</span>
                        </div>
                      )}

                      {loginError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          <AlertCircle className="h-4 w-4" />
                          <span>{loginError}</span>
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-bold shadow-lg transition-all"
                        disabled={isLoggingIn || (otpSent ? !otp : !showPasswordField || !password)}
                      >
                        {isLoggingIn ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Signing In...
                          </span>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Members: Please use the OTP sent to your email for login.
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleRegistration} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Please enter your full name"
                          required
                          disabled={isRegistering}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Please enter your email"
                          required
                          disabled={isRegistering}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gaam</Label>

                        <Select
                          value={gaamId}
                          onValueChange={(value) => setGaamId(value)}
                          required
                          disabled={isRegistering || isLoadingGaams}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Please select your gaam" />
                          </SelectTrigger>
                          <SelectContent>
                            {gaams.map((gaam) => (
                              <SelectItem key={gaam.id} value={gaam.id}>
                                {gaam.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                      </div>
                      <div className="flex items-start space-x-2 mt-4 bg-secondary/5 p-3 rounded-lg border border-secondary/10">
                        <input
                          type="checkbox"
                          id="disclaimer"
                          checked={acceptedDisclaimer}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowConsentModal(true)
                            } else {
                              setAcceptedDisclaimer(false)
                            }
                          }}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer"
                        />
                        <Label htmlFor="disclaimer" className="text-xs text-gray-600 cursor-pointer italic leading-relaxed">
                          I hereby consent to the collection and processing of my family information for community purposes. I have read and agree to the <span className="text-secondary font-bold underline">Terms & Disclaimer</span>.
                        </Label>
                      </div>

                      {registrationError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          <AlertCircle className="h-4 w-4" />
                          <span>{registrationError}</span>
                        </div>
                      )}
                      {registrationMessage && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-md">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{registrationMessage}</span>
                        </div>
                      )}

                      {acceptedDisclaimer && (
                        <Button
                          type="submit"
                          className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 text-lg font-bold shadow-lg transition-all animate-in zoom-in-95 duration-300"
                          disabled={isRegistering}
                        >
                          {isRegistering ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting...
                            </span>
                          ) : (
                            'Submit Registration'
                          )}
                        </Button>
                      )}
                      <p className="text-xs text-gray-500">
                        Your registration will be sent to your Gaam Admin for verification. You’ll receive an email once your account is activated.                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <FooterPage />

      {/* Disclaimer/Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="max-w-2xl w-full shadow-2xl border-secondary/20 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-secondary/10 border-b border-secondary/10">
              <CardTitle className="text-primary flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-secondary" />
                Community Consent & Disclaimer
              </CardTitle>
              <CardDescription>Please review and accept our terms to proceed with registration.</CardDescription>
            </CardHeader>
            <CardContent className="py-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-primary">By registering with 12Gaam Community, you agree to the following:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Your information will be visible to community members and administrators for networking purposes.</li>
                  <li>We implement security measures for data protection against all threats.</li>
                  <li>You are responsible for maintaining the accuracy of your family information.</li>
                  <li>Community administrators reserve the right to verify and moderate any submitted content.</li>
                  <li>You will receive periodic updates and notifications related to community activities.</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                  <p className="text-xs text-gray-500 italic">
                    Note: Your registration is subject to approval by your gaam administrator. Access to the dashboard will be granted only after verification.
                  </p>
                </div>
              </div>
            </CardContent>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConsentModal(false)
                  setAcceptedDisclaimer(false)
                }}
                className="rounded-full px-8"
              >
                Decline
              </Button>
              <Button
                onClick={() => {
                  setShowConsentModal(false)
                  setAcceptedDisclaimer(true)
                }}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-lg shadow-primary/20"
              >
                I Accept & Consent
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

