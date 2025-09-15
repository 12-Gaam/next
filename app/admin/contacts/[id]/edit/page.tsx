'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Users,
  Home,
  Plus,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface Contact {
  id: string
  firstname: string
  middlename?: string
  lastname?: string
  spouseName?: string
  fatherName?: string
  motherName?: string
  gender?: string
  gaam?: string
  currentAddress?: string
  city?: string
  stateId?: string
  countryId?: string
  state?: { name: string }
  country?: { name: string }
  phone: string
  email: string
  dob?: string
  educationId?: string
  otherEducation?: string
  education?: { name: string }
  professionId?: string
  otherProfession?: string
  profession?: { name: string }
  website?: string
  profile?: string
  children: any[]
  siblings: any[]
  createdAt: string
}

interface MasterData {
  countries: any[]
  states: any[]
  cities: any[]
  educations: any[]
  professions: any[]
}

export default function ContactEditPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [masterData, setMasterData] = useState<MasterData>({
    countries: [],
    states: [],
    cities: [],
    educations: [],
    professions: []
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchContact()
    fetchMasterData()
  }, [session, status, router, params.id])

  const fetchContact = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contacts/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setContact(data)
      } else {
        alert('Failed to fetch contact')
        router.push('/admin/contacts')
      }
    } catch (error) {
      console.error('Error fetching contact:', error)
      alert('Failed to fetch contact')
      router.push('/admin/contacts')
    } finally {
      setLoading(false)
    }
  }

  const fetchMasterData = async () => {
    try {
      const [countriesRes, educationsRes, professionsRes] = await Promise.all([
        fetch('/api/countries'),
        fetch('/api/educations'),
        fetch('/api/professions')
      ])

      const [countries, educations, professions] = await Promise.all([
        countriesRes.json(),
        educationsRes.json(),
        professionsRes.json()
      ])

      setMasterData(prev => ({ 
        ...prev, 
        countries, 
        educations, 
        professions 
      }))
    } catch (error) {
      console.error('Error fetching master data:', error)
    }
  }

  const fetchStates = async (countryId: string) => {
    try {
      const response = await fetch(`/api/states?countryId=${countryId}`)
      const states = await response.json()
      setMasterData(prev => ({ ...prev, states, cities: [] }))
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const handleCountryChange = (countryId: string) => {
    setContact(prev => prev ? { ...prev, countryId, stateId: '', city: '' } : null)
    if (countryId) {
      fetchStates(countryId)
    }
  }

  const handleStateChange = (stateId: string) => {
    setContact(prev => prev ? { ...prev, stateId, city: '' } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact) return

    setSaving(true)
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      })

      if (response.ok) {
        alert('Contact updated successfully!')
        router.push(`/admin/contacts/${params.id}`)
      } else {
        const errorData = await response.json()
        alert(`Failed to update contact: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating contact:', error)
      alert('Failed to update contact. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Contact, value: any) => {
    setContact(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contact...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Contact not found</p>
            <Button onClick={() => router.push('/admin/contacts')} className="mt-4">
              Back to Contacts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/admin/contacts/${params.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Contact
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Contact</h1>
                <p className="text-gray-600">Update contact information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center text-blue-800">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstname">First Name *</Label>
                    <Input
                      id="firstname"
                      value={contact.firstname}
                      onChange={(e) => updateField('firstname', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middlename">Middle Name</Label>
                    <Input
                      id="middlename"
                      value={contact.middlename || ''}
                      onChange={(e) => updateField('middlename', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input
                      id="lastname"
                      value={contact.lastname || ''}
                      onChange={(e) => updateField('lastname', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={contact.gender || ''} onValueChange={(value) => updateField('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={contact.dob ? contact.dob.split('T')[0] : ''}
                      onChange={(e) => updateField('dob', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gaam">Gaam</Label>
                    <Input
                      id="gaam"
                      value={contact.gaam || ''}
                      onChange={(e) => updateField('gaam', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center text-green-800">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={contact.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={contact.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center text-purple-800">
                  <Users className="h-5 w-5 mr-2" />
                  Family Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="spouseName">Spouse Name</Label>
                    <Input
                      id="spouseName"
                      value={contact.spouseName || ''}
                      onChange={(e) => updateField('spouseName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input
                      id="fatherName"
                      value={contact.fatherName || ''}
                      onChange={(e) => updateField('fatherName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherName">Mother's Name</Label>
                    <Input
                      id="motherName"
                      value={contact.motherName || ''}
                      onChange={(e) => updateField('motherName', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <CardTitle className="flex items-center text-orange-800">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentAddress">Current Address</Label>
                    <Input
                      id="currentAddress"
                      value={contact.currentAddress || ''}
                      onChange={(e) => updateField('currentAddress', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={contact.countryId || ''} onValueChange={handleCountryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterData.countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select 
                        value={contact.stateId || ''} 
                        onValueChange={handleStateChange}
                        disabled={!contact.countryId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterData.states.map((state) => (
                            <SelectItem key={state.id} value={state.id}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={contact.city || ''}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education & Profession */}
            <Card className="shadow-lg border-0 lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
                <CardTitle className="flex items-center text-indigo-800">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education & Profession
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Education
                    </h4>
                    <div>
                      <Label htmlFor="education">Education Level</Label>
                      <Select value={contact.educationId || ''} onValueChange={(value) => updateField('educationId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select education" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterData.educations.map((education) => (
                            <SelectItem key={education.id} value={education.id}>
                              {education.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="otherEducation">Other Education</Label>
                      <Input
                        id="otherEducation"
                        value={contact.otherEducation || ''}
                        onChange={(e) => updateField('otherEducation', e.target.value)}
                        placeholder="Specify if not in list"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Profession
                    </h4>
                    <div>
                      <Label htmlFor="profession">Profession</Label>
                      <Select value={contact.professionId || ''} onValueChange={(value) => updateField('professionId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterData.professions.map((profession) => (
                            <SelectItem key={profession.id} value={profession.id}>
                              {profession.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="otherProfession">Other Profession</Label>
                      <Input
                        id="otherProfession"
                        value={contact.otherProfession || ''}
                        onChange={(e) => updateField('otherProfession', e.target.value)}
                        placeholder="Specify if not in list"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="shadow-lg border-0 lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-gray-800">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <Label htmlFor="profile">Profile</Label>
                  <textarea
                    id="profile"
                    value={contact.profile || ''}
                    onChange={(e) => updateField('profile', e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
