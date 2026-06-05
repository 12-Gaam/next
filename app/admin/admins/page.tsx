'use client'

import React, { useState, useEffect } from 'react'
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
  ArrowLeft,
  User
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Admin {
  id: string
  fullName: string
  email: string
  username: string
  role: string
  status: string
  createdAt: string
  profilePic?: string | null
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
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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
      {/* <header className="bg-primary shadow-lg border-b border-gray-200 sticky top-0 z-50">
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
      </header> */}

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
              <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-xl border border-gray-200 shadow-sm relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin Profile</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned GAAMs</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {admins.map((admin) => (
                      <React.Fragment key={admin.id}>
                        <tr className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div 
                                className={`flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center transition-all ${admin.profilePic ? 'cursor-zoom-in hover:ring-2 hover:ring-blue-400' : ''}`}
                                onClick={() => admin.profilePic && setPreviewImage(admin.profilePic)}
                              >
                                {admin.profilePic ? (
                                  <img className="h-full w-full object-cover" src={admin.profilePic} alt={admin.fullName} />
                                ) : (
                                  <User className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{admin.fullName}</div>
                                <div className="text-sm text-gray-500">{admin.email}</div>
                                {admin.username !== admin.email && (
                                  <div className="text-xs font-medium text-gray-400 mt-0.5">@{admin.username}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {admin.gaamsManaged && admin.gaamsManaged.length > 0 ? (
                              <div className="flex flex-wrap gap-2 max-w-[250px]">
                                {admin.gaamsManaged.map((gaam) => (
                                  <span key={gaam.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {gaam.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                            {formatDate(admin.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingAdminId !== admin.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingAdminId(admin.id)
                                  const currentGaams = admin.gaamsManaged && admin.gaamsManaged.length > 0
                                    ? admin.gaamsManaged.map(g => g.id)
                                    : []
                                  setGaamAssignment({ ...gaamAssignment, [admin.id]: currentGaams })
                                }}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                              >
                                {admin.gaamsManaged && admin.gaamsManaged.length > 0 ? 'Edit GAAMs' : 'Assign GAAMs'}
                              </Button>
                            )}
                          </td>
                        </tr>
                        
                        {/* Edit GAAM Assignment Row */}
                        {editingAdminId === admin.id && (
                          <tr>
                            <td colSpan={4} className="px-6 py-6 bg-blue-50/30 border-y border-blue-100">
                              <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                                <h4 className="text-base font-semibold text-gray-900 mb-4">Manage Assignments for {admin.fullName}</h4>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Select GAAMs to Assign
                                    </Label>
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                                      {getAvailableGaams().length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No GAAMs available to assign</p>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {getAvailableGaams().map((gaam) => {
                                            const isSelected = (gaamAssignment[admin.id] || []).includes(gaam.id)
                                            return (
                                              <label
                                                key={gaam.id}
                                                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={isSelected}
                                                  onChange={() => toggleGaamSelection(admin.id, gaam.id)}
                                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{gaam.name}</span>
                                              </label>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2 font-medium">
                                      {((gaamAssignment[admin.id] || []).length)} GAAM(s) currently selected
                                    </p>
                                  </div>
                                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingAdminId(null)
                                        const originalGaams = admin.gaamsManaged && admin.gaamsManaged.length > 0
                                          ? admin.gaamsManaged.map(g => g.id)
                                          : []
                                        setGaamAssignment({ ...gaamAssignment, [admin.id]: originalGaams })
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateGaamAssignment(admin.id)}
                                      disabled={isSubmitting}
                                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    >
                                      {isSubmitting ? 'Saving Changes...' : 'Save Assignments'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={previewImage} 
              alt="Profile Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

