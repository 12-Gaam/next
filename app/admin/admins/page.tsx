'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserPlus,
  Users,
  X,
  LogOut,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Admin {
  id: string
  fullName: string
  email: string
  username: string
  role: string
  status: string
  createdAt: string
  gaamsManaged: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface Gaam {
  id: string
  name: string
  slug: string
  adminId: string | null // For backward compatibility, but will be deprecated
  admins?: Array<{ id: string; fullName: string; email: string }> // New structure
}

export default function SuperAdminAdminsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [gaams, setGaams] = useState<Gaam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for creating admin
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: ''
  })

  // Form state for editing GAAM assignment (now supports multiple gaams)
  const [gaamAssignment, setGaamAssignment] = useState<{ [key: string]: string[] }>({})

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      router.push('/admin')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [adminsRes, gaamsRes] = await Promise.all([
        fetch('/api/admins'),
        fetch('/api/gaams')
      ])

      if (!adminsRes.ok || !gaamsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const adminsData = await adminsRes.json()
      const gaamsData = await gaamsRes.json()

      setAdmins(adminsData)
      setGaams(gaamsData)

      // Initialize GAAM assignment state (now supports multiple gaams)
      const initialAssignments: { [key: string]: string[] } = {}
      adminsData.forEach((admin: Admin) => {
        if (admin.gaamsManaged && admin.gaamsManaged.length > 0) {
          initialAssignments[admin.id] = admin.gaamsManaged.map(g => g.id)
        } else {
          initialAssignments[admin.id] = []
        }
      })
      setGaamAssignment(initialAssignments)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin')
      }

      setSuccess('Admin created successfully!')
      setFormData({ fullName: '', email: '', username: '', password: '' })
      setShowCreateForm(false)
      fetchData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateGaamAssignment = async (adminId: string) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      let selectedGaamIds = gaamAssignment[adminId] || []
      
      // Ensure it's an array and filter out invalid values
      if (!Array.isArray(selectedGaamIds)) {
        selectedGaamIds = []
      }
      
      // Filter out invalid IDs (single characters, "none", empty strings, etc.)
      selectedGaamIds = selectedGaamIds.filter((id: string) => {
        return (
          typeof id === 'string' &&
          id.length > 10 && // Valid CUIDs are longer
          id !== 'none' &&
          id.trim() !== ''
        )
      })

      const response = await fetch(`/api/admins/${adminId}/gaam`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gaamIds: selectedGaamIds })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update GAAM assignment')
      }

      setSuccess('GAAM assignment updated successfully!')
      setEditingAdminId(null)
      fetchData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update GAAM assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  // Get all available GAAMs (now multiple admins can be assigned to same gaam)
  const getAvailableGaams = () => {
    return gaams
  }

  // Toggle gaam selection for an admin
  const toggleGaamSelection = (adminId: string, gaamId: string) => {
    const currentSelection = gaamAssignment[adminId] || []
    const isSelected = currentSelection.includes(gaamId)
    
    if (isSelected) {
      setGaamAssignment({
        ...gaamAssignment,
        [adminId]: currentSelection.filter(id => id !== gaamId)
      })
    } else {
      setGaamAssignment({
        ...gaamAssignment,
        [adminId]: [...currentSelection, gaamId]
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <span className="text-2xl font-bold text-white">
                  Admin Management
                </span>
                <p className="text-sm text-white/80 mb-0">Manage GAAM Admins and Assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white mb-0">Super Admin</p>
                <p className="text-sm text-white/80 mb-0">{session.user.username}</p>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex items-center bg-secondary hover:bg-secondary/90 text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-700">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Create Admin Section */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl font-semibold text-gray-800">
                  <UserPlus className="h-5 w-5" />
                  <span>Create New Admin</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Create a new GAAM admin. GAAM assignment can be done after creation.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setShowCreateForm(!showCreateForm)
                  setError(null)
                  setSuccess(null)
                }}
                className="bg-secondary hover:bg-secondary/90"
              >
                {showCreateForm ? 'Cancel' : 'Create Admin'}
              </Button>
            </div>
          </CardHeader>

          {showCreateForm && (
            <CardContent className="pt-6">
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="Enter password"
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setFormData({ fullName: '', email: '', username: '', password: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/90">
                    {isSubmitting ? 'Creating...' : 'Create Admin'}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Admins List */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="flex items-center space-x-2 text-xl font-semibold text-blue-800">
              <Users className="h-5 w-5" />
              <span>GAAM Admins ({admins.length})</span>
            </CardTitle>
            <CardDescription className="text-blue-600">
              View and manage admin users and their GAAM assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {admins.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No admins found. Create your first admin above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <Card key={admin.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{admin.fullName}</h3>
                            <p className="text-sm text-gray-600 truncate">{admin.email}</p>
                            <p className="text-xs text-gray-500 mt-1">@{admin.username}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1.5">Assigned GAAMs</p>
                              {admin.gaamsManaged && admin.gaamsManaged.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {admin.gaamsManaged.map((gaam) => (
                                    <span key={gaam.id} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                                      {gaam.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No GAAM assigned</span>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1.5">Created</p>
                              <p className="text-sm text-gray-700 font-medium">
                                {new Date(admin.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                           
                           
                          </div>

                          {/* Edit GAAM Assignment */}
                          {editingAdminId === admin.id && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Assign GAAMs (Multiple selection allowed):
                                  </Label>
                                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
                                    {getAvailableGaams().length === 0 ? (
                                      <p className="text-sm text-gray-500">No GAAMs available</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {getAvailableGaams().map((gaam) => {
                                          const isSelected = (gaamAssignment[admin.id] || []).includes(gaam.id)
                                          return (
                                            <label
                                              key={gaam.id}
                                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleGaamSelection(admin.id, gaam.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                              />
                                              <span className="text-sm text-gray-700">{gaam.name}</span>
                                            </label>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Selected: {(gaamAssignment[admin.id] || []).length} GAAM(s)
                                  </p>
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateGaamAssignment(admin.id)}
                                    disabled={isSubmitting}
                                    className="bg-secondary hover:bg-secondary/90"
                                  >
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingAdminId(null)
                                      // Reset to original value (array of gaam IDs)
                                      const originalGaams = admin.gaamsManaged && admin.gaamsManaged.length > 0
                                        ? admin.gaamsManaged.map(g => g.id)
                                        : []
                                      setGaamAssignment({ ...gaamAssignment, [admin.id]: originalGaams })
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {editingAdminId !== admin.id && (
                          <div className="flex-shrink-0 lg:self-start">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAdminId(admin.id)
                                // Initialize with current assignment (array of gaam IDs)
                                const currentGaams = admin.gaamsManaged && admin.gaamsManaged.length > 0
                                  ? admin.gaamsManaged.map(g => g.id)
                                  : []
                                setGaamAssignment({ ...gaamAssignment, [admin.id]: currentGaams })
                              }}
                              className="w-full lg:w-auto whitespace-nowrap"
                            >
                              {admin.gaamsManaged && admin.gaamsManaged.length > 0 ? 'Edit ' : 'Assign'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

