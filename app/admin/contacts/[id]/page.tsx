'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  Home
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
  state?: { name: string }
  country?: { name: string }
  phone: string
  email: string
  dob?: string
  education?: { name: string }
  otherEducation?: string
  profession?: { name: string }
  otherProfession?: string
  website?: string
  profile?: string
  children: any[]
  siblings: any[]
  createdAt: string
}

export default function ContactViewPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Contact deleted successfully!')
        router.push('/admin/contacts')
      } else {
        const errorData = await response.json()
        alert(`Failed to delete contact: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
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
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contact Details</h1>
                <p className="text-gray-600">Viewing contact information</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {/* <Link href={`/admin/contacts/${params.id}/edit`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Contact
                </Button>
              </Link> */}
              {/* <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button> */}
              <Link href="/admin/contacts">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Contacts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-gray-900 font-medium">{contact.firstname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Middle Name</label>
                  <p className="text-gray-900">{contact.middlename || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-gray-900">{contact.lastname || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900">{contact.gender || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">
                    {contact.dob ? new Date(contact.dob).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gaam</label>
                  <p className="text-gray-900">{contact.gaam || '-'}</p>
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
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 font-medium">{contact.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900 font-medium">{contact.phone}</p>
                  </div>
                </div>
                {contact.website && (
                  <div className="flex items-center space-x-3">
                    <Home className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <p className="text-gray-900 font-medium">
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {contact.website}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
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
                  <label className="text-sm font-medium text-gray-500">Spouse Name</label>
                  <p className="text-gray-900">{contact.spouseName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Father's Name</label>
                  <p className="text-gray-900">{contact.fatherName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mother's Name</label>
                  <p className="text-gray-900">{contact.motherName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Children</label>
                  <p className="text-gray-900 font-medium">{contact.children.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Siblings</label>
                  <p className="text-gray-900 font-medium">{contact.siblings.length}</p>
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
              <div className="space-y-3">
                {contact.currentAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Address</label>
                    <p className="text-gray-900">{contact.currentAddress}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">City</label>
                    <p className="text-gray-900">{contact.city || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">State</label>
                    <p className="text-gray-900">{contact.state?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    <p className="text-gray-900">{contact.country?.name || '-'}</p>
                  </div>
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
                    <label className="text-sm font-medium text-gray-500">Education Level</label>
                    <p className="text-gray-900">
                      {contact.education?.name || contact.otherEducation || '-'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Profession
                  </h4>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Profession</label>
                    <p className="text-gray-900">
                      {contact.profession?.name || contact.otherProfession || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {contact.profile && (
            <Card className="shadow-lg border-0 lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-gray-800">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Profile</label>
                  <p className="text-gray-900 mt-1">{contact.profile}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Contact created on {new Date(contact.createdAt).toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  )
}
