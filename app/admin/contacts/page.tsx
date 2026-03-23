'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Search,
  Eye,
  Trash2,
  UserPlus
} from 'lucide-react'
import { notification } from 'antd'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Contact {
  id: string
  firstname: string
  middlename?: string
  lastname?: string
  email: string
  phone: string
  cityId?: string
  state?: { name: string }
  country?: { name: string }
  children: any[]
  siblings: any[]
  createdAt: string
}

export default function AdminContactsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') || ''

  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState(filterParam)
  const [gaamFilter, setGaamFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [countries, setCountries] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalContacts, setTotalContacts] = useState(0)
  const [newThisMonthCount, setNewThisMonthCount] = useState<number | string>('...')

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchCountries()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [debouncedSearch, filter, gaamFilter, countryFilter, currentPage])

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries')
      const data = await response.json()
      setCountries(data || [])
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (data && typeof data.newThisMonth === 'number') {
        setNewThisMonthCount(data.newThisMonth)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchContacts = async () => {
    try {
      if (contacts.length === 0) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const response = await fetch(
        `/api/contacts?page=${currentPage}&limit=10&search=${debouncedSearch}&filter=${filter}&gaam=${gaamFilter}&countryId=${countryFilter}`
      )
      const data = await response.json()

      setContacts(data.contacts || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotalContacts(data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleView = (contactId: string) => {
    router.push(`/admin/contacts/${contactId}`)
  }

  const handleDelete = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        notification.success({
          message: 'Contact deleted successfully!',
          placement: 'topRight',
        })
        fetchContacts()
        fetchStats()
      } else {
        const errorData = await response.json()
        notification.error({
          message: `Failed to delete contact: ${errorData.error || 'Unknown error'}`,
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      notification.error({
        message: 'Failed to delete contact. Please try again.',
        placement: 'topRight',
      })
    }
  }

  if (!session) return null

  return (
    <>
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Contact Management
          </h1>
          <p className="text-gray-500 mt-1">
            Browse, search and manage community members
          </p>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Members</p>
                <p className="text-2xl font-black mt-1 text-gray-900">{totalContacts}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">New This Month</p>
                <p className="text-2xl font-black mt-1 text-gray-900">
                  {newThisMonthCount}
                </p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Filtered View</p>
                <p className="text-2xl font-black mt-1 text-gray-900">{contacts.length}</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">
                {filter === 'this_month' ? 'New Members This Month' : 'Member Directory'}
              </CardTitle>
              <CardDescription>
                Showing {contacts.length} of {totalContacts} results
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={gaamFilter}
                onValueChange={(value) => {
                  setGaamFilter(value === 'all' ? '' : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-40 bg-white border-gray-200">
                  <SelectValue placeholder="Gaam Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gaams</SelectItem>
                  {["Pisai", "Puniyad", "Sandha", "Bhekhda", "Avakhal", "Kukas", "Manjrol", "Vemar", "Malpur", "Juni Jithardi", "Someswarpura", "Jaferpura", "Alindra", "Tarsana"].map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={countryFilter}
                onValueChange={(value) => {
                  setCountryFilter(value === 'all' ? '' : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-44 bg-white border-gray-200">
                  <SelectValue placeholder="Country Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {(filter || searchTerm || gaamFilter || countryFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilter('')
                    setSearchTerm('')
                    setGaamFilter('')
                    setCountryFilter('')
                    setCurrentPage(1)
                    router.push('/admin/contacts')
                  }}
                  className="text-gray-500 hover:text-blue-600 font-bold px-3 py-1"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative">
          {isRefreshing && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[2px] transition-all">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Loading membership directory...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="p-6 bg-gray-50 rounded-full mb-6">
                <Users className="h-16 w-16 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No members found</h3>
              <p className="text-gray-500 mt-2 max-w-sm">
                We couldn't find any members matching your current filters or search criteria.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setFilter('')
                  setSearchTerm('')
                  setGaamFilter('')
                  setCountryFilter('')
                }}
              >
                Reset all filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Name & Identity</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Details</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Family</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="group border-b border-gray-50 hover:bg-blue-50/30 transition-all duration-200">
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                            {contact.firstname} {contact.middlename} {contact.lastname}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">Joined {new Date(contact.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-700">{contact.email}</span>
                          <span className="text-xs text-gray-500">{contact.phone}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{contact.cityId || 'N/A'}</span>
                          <span className="text-xs text-gray-500">
                            {contact.state?.name}, {contact.country?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">
                            Child: {contact.children.length}
                          </div>
                          <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">
                            Sib: {contact.siblings.length}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleView(contact.id)}
                            className="h-8 px-3 text-xs bg-white border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-none"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Details
                          </Button>
                          {session.user.role === 'SUPER_ADMIN' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(contact.id)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-gray-50 bg-gray-50/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-9 px-4 border-gray-200 bg-white font-bold"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "default" : "ghost"}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 p-0 font-bold ${currentPage === page
                      ? 'bg-blue-600 border-blue-600'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-9 px-4 border-gray-200 bg-white font-bold"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
