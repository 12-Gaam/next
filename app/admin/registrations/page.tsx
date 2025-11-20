'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Check, Loader2 } from 'lucide-react'

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
  }, [session, status, statusFilter, router])

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      const response = await fetch(`/api/registrations?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load registrations')
      }
      setRegistrations(data.registrations || [])
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
      <header className="bg-primary text-white py-6 shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Registration Approvals</h1>
          <p className="text-sm text-white/80">Review member requests assigned to your gaam.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>
                Approve or reject new family registrations. Approved members can access their dashboard immediately.
              </CardDescription>
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              No registrations found for this filter.
            </CardContent>
          </Card>
        ) : (
          registrations.map((registration) => (
            <Card key={registration.id}>
              <CardContent className="py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-primary">{registration.fullName}</p>
                  <p className="text-sm text-gray-600">{registration.email}</p>
                  <p className="text-sm text-gray-600">Username: {registration.username}</p>
                  <p className="text-sm text-gray-600">
                    Gaam: {registration.gaam?.name || 'Unassigned'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted on {new Date(registration.createdAt).toLocaleDateString()}
                  </p>
                  {registration.verificationNotes && (
                    <p className="text-xs text-gray-500">
                      Notes: {registration.verificationNotes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col md:items-end gap-3">
                  {renderStatusBadge(registration.status)}
                  {registration.status === 'PENDING' ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-600"
                        disabled={actionInProgress === registration.id}
                        onClick={() => handleAction(registration.id, 'APPROVED')}
                      >
                        {actionInProgress === registration.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-600"
                        disabled={actionInProgress === registration.id}
                        onClick={() => handleAction(registration.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Verified by {registration.verifiedBy?.fullName || '—'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  )
}

