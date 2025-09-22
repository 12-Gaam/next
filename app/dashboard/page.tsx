'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Building2, 
  FileText, 
  Plus,
  Edit,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import HeaderPage from '@/components/common/HeaderPage'
import FooterPage from '@/components/common/FooterPage'

interface Contact {
  id: string
  firstname: string
  middlename?: string
  lastname?: string
  email: string
  phone: string
  city?: string
  state?: { name: string }
  country?: { name: string }
  children: any[]
  siblings: any[]
  createdAt: string
}

export default function UserDashboard() {
  const [showForm, setShowForm] = useState(false)
  const [hasContact, setHasContact] = useState(false)
  const [contact, setContact] = useState<Contact | null>(null)

  useEffect(() => {
    checkExistingContact()
  }, [])

  const checkExistingContact = async () => {
    try {
      // Check if there are any existing contacts
      // For now, we'll just show the form to everyone
      setHasContact(false)
    } catch (error) {
      console.error('Error checking existing contact:', error)
    }
  }



  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">12Gaam11</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome to 12Gaam
              </span>
             
            </div>
          </div>
        </div>
      </header> */}

      <HeaderPage />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Submit your contact information to join the 12Gaam community. 
          </p>
        </div>

        {!showForm && !hasContact && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Welcome to 12Gaam!</span>
              </CardTitle>
              <CardDescription>
                Complete your profile by filling out the contact form below. This helps us 
                maintain accurate community records and connect you with other members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90">
                <Plus className="h-4 w-4" />
                <span>Add Contact</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {!showForm && hasContact && contact && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Your Profile</span>
              </CardTitle>
              <CardDescription>
                Your contact information has been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg">
                    {contact.firstname} {contact.middlename} {contact.lastname}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{contact.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-lg">{contact.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-lg">
                    {contact.city}, {contact.state?.name}, {contact.country?.name}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
                <Button className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>View Full Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Please fill out all the required information below. You can save your progress 
                and come back later to complete it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm 
                onSuccess={() => {
                  setShowForm(false)
                  setHasContact(true)
                  checkExistingContact()
                }}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}


      </main>
    </div>
    <FooterPage />
    </>
  )
}
