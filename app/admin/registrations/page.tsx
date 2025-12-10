'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Registration {
  id: string
  fullName: string
  email: string
  username: string
  status: string
  createdAt: string
  gaam?: { id: string; name: string }
  verificationNotes?: string | null
  verifiedBy?: { id: string; fullName: string } | null
}

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' }
]

export default function RegistrationApprovalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRegistrations, setTotalRegistrations] = useState(0)
  const limit = 100

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

    fetchRegistrations()
  }, [session, status, statusFilter, currentPage, router])

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      params.append('page', currentPage.toString())
      params.append('limit', limit.toString())
      const response = await fetch(`/api/registrations?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load registrations')
      }
      setRegistrations(data.registrations || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotalRegistrations(data.pagination?.total || 0)
    } catch (error) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'Failed to load registrations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    const notes = action === 'REJECTED' ? prompt('Add rejection note (optional):') : undefined
    setActionInProgress(id)
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action, notes })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update registration')
      }
      await fetchRegistrations()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setActionInProgress(null)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-2xl font-bold text-white">Registration Approvals</h1>
                <p className="text-sm text-white/80 mb-0">Review member requests assigned to your gaam.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">Pending Actions</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Approve or reject new family registrations. Approved members can access their dashboard immediately.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="w-full md:w-64">
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value)
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {totalRegistrations > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    Showing {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalRegistrations)} of {totalRegistrations}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 p-4 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : registrations.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-10 text-center text-gray-500">
              No registrations found for this filter.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {registrations.map((registration) => (
                <Card key={registration.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-800 truncate">{registration.fullName}</p>
                            <p className="text-sm text-gray-600 mt-1 truncate">{registration.email}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {renderStatusBadge(registration.status)}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Username</p>
                            <p className="text-sm text-gray-700 font-medium truncate">{registration.username}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Gaam</p>
                            <p className="text-sm text-gray-700 font-medium truncate">{registration.gaam?.name || 'Unassigned'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Submitted</p>
                            <p className="text-sm text-gray-700 font-medium">
                              {new Date(registration.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          {registration.verifiedBy && (
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 mb-1">Verified by</p>
                              <p className="text-sm text-gray-700 font-medium truncate">{registration.verifiedBy.fullName}</p>
                            </div>
                          )}
                        </div>
                        {registration.verificationNotes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-700 break-words">{registration.verificationNotes}</p>
                          </div>
                        )}
                      </div>
                      {registration.status === 'PENDING' && (
                        <div className="flex flex-row gap-3 flex-shrink-0">
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={actionInProgress === registration.id}
                            onClick={() => handleAction(registration.id, 'APPROVED')}
                          >
                            {actionInProgress === registration.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Approve'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            disabled={actionInProgress === registration.id}
                            onClick={() => handleAction(registration.id, 'REJECTED')}
                          >
                            {actionInProgress === registration.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Reject'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="px-6 py-2 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 10) {
                      pageNum = i + 1
                    } else if (currentPage <= 5) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 4) {
                      pageNum = totalPages - 9 + i
                    } else {
                      pageNum = currentPage - 4 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoading}
                        className={`w-10 h-10 rounded-full ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 text-white border-0' 
                            : 'border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        } transition-all disabled:opacity-50`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-6 py-2 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

