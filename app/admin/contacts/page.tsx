'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Search,
  Eye,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { notification } from 'antd'
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

export default function AdminContactsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalContacts, setTotalContacts] = useState(0)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const allowedRoles = ['SUPER_ADMIN', 'GAAM_ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      router.push('/dashboard')
      return
    }

    fetchContacts()
  }, [session, status, router, currentPage])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1)
        fetchContacts()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/contacts?page=${currentPage}&limit=10&search=${searchTerm}`
      )
      const data = await response.json()
      
      setContacts(data.contacts || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotalContacts(data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchContacts()
  }

  const handleView = (contactId: string) => {
    router.push(`/admin/contacts/${contactId}`)
  }

  const handleEdit = (contactId: string) => {
    router.push(`/admin/contacts/${contactId}/edit`)
  }

  const handleDelete = async (contactId: string) => {
    // if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Show success message
        notification.success({
          message: 'Contact deleted successfully!',
          placement: 'topRight',
          duration: 4.5,
        })
        fetchContacts()
      } else {
        const errorData = await response.json()
        notification.error({
          message: `Failed to delete contact: ${errorData.error || 'Unknown error'}`,
          placement: 'topRight',
          duration: 4.5,
        })
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      notification.error({
        message: 'Failed to delete contact. Please try again.',
        placement: 'topRight',
        duration: 4.5,
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const allowedRoles = ['SUPER_ADMIN', 'GAAM_ADMIN']
  if (!session || !allowedRoles.includes(session.user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">12Gaam Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className='bg-secondary hover:bg-secondary/90 text-white px-4 py-3 rounded-lg flex items-center gap-2'>
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">
            Contact Management
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Manage all community contacts and member information
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Contacts</p>
                  <p className="text-3xl font-bold">{totalContacts}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Members</p>
                  <p className="text-3xl font-bold">{totalContacts}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">This Month</p>
                  <p className="text-3xl font-bold">{totalContacts}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Contacts Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">All Contacts</CardTitle>
                <CardDescription className="text-gray-600">
                  Showing {contacts.length} of {totalContacts} contacts
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <Button 
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Search
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading contacts...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contacts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Family</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Joined</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {contact.firstname} {contact.middlename} {contact.lastname}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{contact.email}</div>
                            <div className="text-gray-500">{contact.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {contact.city && <div>{contact.city}</div>}
                            {contact.state && <div className="text-gray-500">{contact.state.name}</div>}
                            {contact.country && <div className="text-gray-500">{contact.country.name}</div>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>Children: {contact.children.length}</div>
                            <div>Siblings/Brother/sister: {contact.siblings.length}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleView(contact.id)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                             {/* <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(contact.id)}
                              className="hover:bg-green-50 hover:text-green-600"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button> */}
                            {session.user.role === 'SUPER_ADMIN' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDelete(contact.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-2 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white border-0' 
                          : 'border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                      } transition-all`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <FooterPage />
    </div>
  )
}
