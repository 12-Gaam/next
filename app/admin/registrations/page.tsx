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
import { formatDate } from '@/lib/utils'

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
  const { data: session } = useSession()
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
    fetchRegistrations()
  }, [statusFilter, currentPage])

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
    setActionInProgress(`${id}-${action}`)
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

  if (!session) return null

  return (
    <>
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Registration Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Review and approve member registration requests
          </p>
        </div>
      </div>

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
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-xl border border-gray-200 shadow-sm relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant Details</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned GAAM</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submission Date</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{registration.fullName}</div>
                          <div className="text-sm text-gray-500">{registration.email}</div>
                          {registration.username !== registration.email && (
                            <div className="text-xs font-medium text-gray-400 mt-0.5">@{registration.username}</div>
                          )}
                          {registration.verificationNotes && (
                            <div className="mt-2 p-2 bg-yellow-50/50 border border-yellow-100 rounded text-xs text-yellow-800 max-w-sm whitespace-normal">
                              <span className="font-semibold">Notes:</span> {registration.verificationNotes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {registration.gaam?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-medium">{formatDate(registration.createdAt)}</div>
                        {registration.verifiedBy && (
                          <div className="text-xs text-gray-500 mt-1">Verified by: {registration.verifiedBy.fullName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(registration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {registration.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                              disabled={actionInProgress?.startsWith(registration.id)}
                              onClick={() => handleAction(registration.id, 'APPROVED')}
                            >
                              {actionInProgress === `${registration.id}-APPROVED` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                              disabled={actionInProgress?.startsWith(registration.id)}
                              onClick={() => handleAction(registration.id, 'REJECTED')}
                            >
                              {actionInProgress === `${registration.id}-REJECTED` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Reject'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                        className={`w-10 h-10 rounded-full ${currentPage === pageNum
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
    </>
  )
}

