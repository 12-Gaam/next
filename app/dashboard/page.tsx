'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus, User, Users, Baby, UserCog, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Globe, Edit2, UserCircle } from 'lucide-react'
import ContactForm from '@/components/ContactForm'
import HeaderPage from '@/components/common/HeaderPage'
import FooterPage from '@/components/common/FooterPage'

interface Contact {
  id: string
  firstname: string
  middlename?: string
  lastname?: string
  email?: string
  phone: string
  city?: string
  cityId?: string
  state?: { name: string }
  country?: { name: string }
  currentAddress?: string
  countryCode?: string
  dob?: string
  gender?: string
  maritalStatus?: string
  is18Plus?: boolean
  gaam?: string
  education?: { name: string }
  otherEducation?: string
  profession?: { name: string }
  otherProfession?: string
  website?: string
  profilePic?: string
  familyPhoto?: string
  fb?: string
  linkedin?: string
  insta?: string
  tiktok?: string
  twitter?: string
  snapchat?: string
  spouseFirstName?: string
  spouseMiddleName?: string
  spouseLastName?: string
  fatherFirstName?: string
  fatherMiddleName?: string
  fatherLastName?: string
  motherFirstName?: string
  motherMiddleName?: string
  motherLastName?: string
  children: any[]
  siblings: any[]
  createdAt: string
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showForm, setShowForm] = useState(false)
  const [isAddingFamilyMembers, setIsAddingFamilyMembers] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [contact, setContact] = useState<Contact | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'family'>('dashboard')
  
  // Initialize hasAutoShownForm from localStorage (persists across reloads)
  const [hasAutoShownForm, setHasAutoShownFormState] = useState(false)
  
  // Helper to update both state and localStorage
  const setHasAutoShownForm = (value: boolean) => {
    setHasAutoShownFormState(value)
    if (typeof window !== 'undefined' && session?.user?.id) {
      const key = `hasAutoShownForm_${session.user.id}`
      if (value) {
        localStorage.setItem(key, 'true')
      } else {
        localStorage.removeItem(key)
      }
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/join?reason=login')
      return
    }

    // Redirect admins to admin dashboard
    if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'GAAM_ADMIN') {
      router.push('/admin')
      return
    }

    if (session.user.status !== 'APPROVED') {
      setIsLoadingProfile(false)
      return
    }

    fetchMyContact()
  }, [session, status, router])

  useEffect(() => {
    // Function to update active tab based on hash
    const updateActiveTab = () => {
      const hash = window.location.hash
      if (hash === '#profile') {
        setActiveTab('profile')
      } else if (hash === '#family') {
        setActiveTab('family')
      } else {
        setActiveTab('dashboard')
      }
    }

    // Check initial hash
    updateActiveTab()

    // Listen for hash changes
    const handleHashChange = () => {
      updateActiveTab()
    }

    // Listen for popstate (back/forward navigation)
    const handlePopState = () => {
      updateActiveTab()
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Update hasAutoShownForm from localStorage when session is available
  useEffect(() => {
    if (session?.user?.id && typeof window !== 'undefined') {
      const key = `hasAutoShownForm_${session.user.id}`
      const stored = localStorage.getItem(key) === 'true'
      setHasAutoShownFormState(stored)
    }
  }, [session?.user?.id])

  // Compute hasContact before using it in useEffect
  const hasContact = Boolean(contact)

  // Update form visibility when tab changes
  useEffect(() => {
    // If user switches to a tab other than dashboard, hide the form (unless adding family members)
    if (activeTab !== 'dashboard' && showForm && !hasContact && !isAddingFamilyMembers) {
      setShowForm(false)
    }
    // Auto-show form on dashboard tab only once when there's no contact and profile has loaded
    else if (activeTab === 'dashboard' && !hasContact && !showForm && !isLoadingProfile && !hasAutoShownForm) {
      setShowForm(true)
      setHasAutoShownForm(true)
    }
  }, [activeTab, hasContact, showForm, isLoadingProfile, hasAutoShownForm, isAddingFamilyMembers])

  const fetchMyContact = async () => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch('/api/contacts?ownership=me')
      const data = await response.json()
      const hasContactData = Boolean(data.contact)
      setContact(data.contact || null)
      // Clear auto-show flag when contact is created (user completed profile)
      if (hasContactData && session?.user?.id) {
        const key = `hasAutoShownForm_${session.user.id}`
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('Error loading profile', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  const isApproved = session.user.status === 'APPROVED'

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const renderDashboardView = () => {
    if (!hasContact || !contact) {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Complete Your Family Profile</span>
            </CardTitle>
            <CardDescription>
              Fill in the details below so your gaam can stay connected with your family.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Add Profile</span>
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-900">
                  <div className="bg-secondary p-2 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <span>Your Family Profile</span>
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Keep your family&rsquo;s details updated whenever something changes.
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingFamilyMembers(false)
                  setShowForm(true)
                }}
                className="border-2 hover:bg-secondary hover:text-primary transition-all"
              >
                <UserCog className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <User className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {contact.firstname} {contact.middlename} {contact.lastname}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Mail className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">{contact.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Phone className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {contact.countryCode || ''} {contact.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {[contact.city, contact.state?.name, contact.country?.name].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {(contact.spouseFirstName || (contact.children && contact.children.length > 0) || (contact.siblings && contact.siblings.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {contact.spouseFirstName && (
              <Card className="shadow-md hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Spouse</p>
                      <p className="text-3xl font-bold text-gray-900">1</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {contact.children && contact.children.length > 0 && (
              <Card className="shadow-md hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Children</p>
                      <p className="text-3xl font-bold text-gray-900">{contact.children.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <Baby className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {contact.siblings && contact.siblings.length > 0 && (
              <Card className="shadow-md hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Siblings</p>
                      <p className="text-3xl font-bold text-gray-900">{contact.siblings.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </>
    )
  }

  const renderProfileView = () => {
    if (!hasContact || !contact) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">No profile found. Please create your profile first.</p>
          
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <UserCircle className="h-6 w-6" />
                  <span>My Complete Profile</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  View and manage all your personal information
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => {
                setIsAddingFamilyMembers(false)
                setShowForm(true)
              }}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-300 text-gray-800">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</p>
                      <p className="text-lg font-medium text-gray-900">
                        {contact.firstname} {contact.middlename} {contact.lastname}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</p>
                      <p className="text-lg text-gray-900 capitalize">{contact.gender || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</p>
                      <p className="text-lg text-gray-900">{formatDate(contact.dob)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marital Status</p>
                      <p className="text-lg text-gray-900 capitalize">{contact.maritalStatus || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age Group</p>
                      <p className="text-lg text-gray-900">{contact.is18Plus ? '18+' : 'Under 18'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gaam</p>
                      <p className="text-lg text-gray-900">{contact.gaam || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-300 text-gray-800">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <Mail className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                        <p className="text-lg text-gray-900 mt-1">{contact.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <Phone className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                        <p className="text-lg text-gray-900 mt-1">{contact.countryCode || ''} {contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <MapPin className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Address</p>
                        <p className="text-lg text-gray-900 mt-1">{contact.currentAddress || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <MapPin className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-lg text-gray-900 mt-1">
                          {[contact.city, contact.state?.name, contact.country?.name].filter(Boolean).join(', ') || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education & Profession */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-300 text-gray-800">Education & Profession</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <GraduationCap className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education</p>
                        <p className="text-lg text-gray-900 mt-1">
                          {contact.education?.name || contact.otherEducation || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <Briefcase className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profession</p>
                        <p className="text-lg text-gray-900 mt-1">
                          {contact.profession?.name || contact.otherProfession || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {contact.website && (
                      <div className="flex items-start space-x-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <Globe className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Website</p>
                          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 hover:underline mt-1 block">
                            {contact.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parents Information */}
                {(contact.fatherFirstName || contact.motherFirstName) && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-300 text-gray-800">Parents Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {contact.fatherFirstName && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Father's Name</p>
                          <p className="text-lg text-gray-900">
                            {contact.fatherFirstName} {contact.fatherMiddleName} {contact.fatherLastName}
                          </p>
                        </div>
                      )}
                      {contact.motherFirstName && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mother's Name</p>
                          <p className="text-lg text-gray-900">
                            {contact.motherFirstName} {contact.motherMiddleName} {contact.motherLastName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                {(contact.fb || contact.linkedin || contact.insta || contact.twitter) && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-300 text-gray-800">Social Media</h3>
                    <div className="flex flex-wrap gap-4">
                      {contact.fb && (
                        <a href={contact.fb} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Facebook
                        </a>
                      )}
                      {contact.linkedin && (
                        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                          LinkedIn
                        </a>
                      )}
                      {contact.insta && (
                        <a href={contact.insta} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                          Instagram
                        </a>
                      )}
                      {contact.twitter && (
                        <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Profile Image */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-sm md:max-w-xs">
                        {contact.profilePic ? (
                          <div className="aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                            <img
                              src={contact.profilePic}
                              alt={`${contact.firstname} ${contact.lastname}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                                      <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                      </svg>
                                    </div>
                                  `
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-[150px] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                            <UserCircle className="w-24 h-24 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="mt-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {contact.firstname} {contact.middlename} {contact.lastname}
                        </h2>
                        {contact.profession?.name && (
                          <p className="text-gray-600 mt-2">{contact.profession.name}</p>
                        )}
                        {contact.gaam && (
                          <p className="text-gray-500 text-sm mt-1">{contact.gaam}</p>
                        )}
                      </div>
                      {contact.familyPhoto && (
                        <div className="mt-6 w-full">
                          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Family Photo</p>
                          <div className="rounded-lg overflow-hidden shadow-lg">
                            <img
                              src={contact.familyPhoto}
                              alt="Family Photo"
                              className="w-full h-auto object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderFamilyView = () => {
    if (!hasContact || !contact) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">No profile found. Please create your profile first.</p>
          </CardContent>
        </Card>
      )
    }

    const hasFamilyMembers = contact.spouseFirstName || 
                            (contact.children && contact.children.length > 0) || 
                            (contact.siblings && contact.siblings.length > 0)

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Manage Family Members</span>
                </CardTitle>
                <CardDescription>
                  Add and manage your family members
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setIsAddingFamilyMembers(true)
                  setShowForm(true)
                }}
                className="bg-secondary hover:bg-secondary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
        </Card>

        {!hasFamilyMembers && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No family members added yet.</p>
             
            </CardContent>
          </Card>
        )}

        {contact.spouseFirstName && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Spouse</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-medium">
                  {contact.spouseFirstName} {contact.spouseMiddleName} {contact.spouseLastName}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {contact.children && contact.children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Baby className="h-5 w-5" />
                <span>Children ({contact.children.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contact.children.map((child: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-lg">
                          {child.firstName} {child.middleName} {child.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {child.gender === 'male' ? 'Male' : 'Female'} • Age: {child.age} years
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {contact.siblings && contact.siblings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Siblings ({contact.siblings.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contact.siblings.map((sibling: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-lg">
                          {sibling.firstName} {sibling.middleName} {sibling.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {sibling.gender === 'male' ? 'Male' : 'Female'} • Age: {sibling.age} years
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <HeaderPage />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isApproved && (
            <Card className="mb-8 border-l-4 border-yellow-500">
              <CardHeader>
                <CardTitle>Registration Under Review</CardTitle>
                <CardDescription>
                  Your gaam admin is reviewing your request. You will be notified via email
                  once it is approved.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {isApproved && (
            <>
              {showForm && (activeTab === 'dashboard' || isAddingFamilyMembers) ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isAddingFamilyMembers 
                        ? 'Add Family Members' 
                        : hasContact 
                          ? 'Update Family Profile' 
                          : 'Family Profile'}
                    </CardTitle>
                    <CardDescription>
                      {isAddingFamilyMembers
                        ? 'Add your spouse, children, and siblings. You can navigate to Step 4 directly to add family members.'
                        : 'Provide as many details as you can. You can always come back and edit later.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContactForm
                      existingContact={contact || undefined}
                      initialStep={isAddingFamilyMembers ? 4 : 1}
                      onSuccess={() => {
                        setShowForm(false)
                        setIsAddingFamilyMembers(false)
                        fetchMyContact()
                      }}
                      onCancel={() => {
                        setShowForm(false)
                        setIsAddingFamilyMembers(false)
                      }}
                    />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <>
                      <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                          Welcome, {session?.user.fullName}
                        </h1>
                        <p className="text-lg text-gray-600">
                          Manage your family profile and keep your contact details up to date.
                        </p>
                      </div>
                      {isLoadingProfile ? (
                        <div className="text-center py-12">Loading...</div>
                      ) : (
                        renderDashboardView()
                      )}
                    </>
                  )}

                  {activeTab === 'profile' && (
                    <>
                      <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-2">
                          your information and profile picture
                        </p>
                      </div>
                      {isLoadingProfile ? (
                        <div className="text-center py-12">Loading...</div>
                      ) : (
                        renderProfileView()
                      )}
                    </>
                  )}

                  {activeTab === 'family' && (
                    <>
                      <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
                        <p className="text-gray-600 mt-2">
                          Manage your family members and add new ones
                        </p>
                      </div>
                      {isLoadingProfile ? (
                        <div className="text-center py-12">Loading...</div>
                      ) : (
                        renderFamilyView()
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
      <FooterPage />
    </>
  )
}
