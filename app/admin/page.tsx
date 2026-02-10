'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Building2,
  LogOut,
  Eye,
  TrendingUp,
  Calendar,
  UserPlus,
  BarChart3,
  UserCog,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    contacts: 0,
    newContactsThisMonth: 0,
    totalCountries: 0,
    totalStates: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

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

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      const [contactsRes, countriesRes, statesRes] = await Promise.all([
        fetch('/api/contacts?limit=1'),
        fetch('/api/countries'),
        fetch('/api/states')
      ])

      const contactsData = await contactsRes.json()
      const countriesData = await countriesRes.json()
      const statesData = await statesRes.json()

      // Calculate new contacts this month
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const newContactsThisMonth = contactsData.contacts?.filter((contact: any) => {
        const contactDate = new Date(contact.createdAt)
        return contactDate.getMonth() === currentMonth && contactDate.getFullYear() === currentYear
      }).length || 0

      setStats({
        contacts: contactsData.pagination?.total || 0,
        newContactsThisMonth,
        totalCountries: countriesData.length || 0,
        totalStates: statesData.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Admin Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we prepare your dashboard</p>
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
      <header className="bg-primary shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-2xl font-bold text-white">
                  12Gaam Admin
                </span>
                <p className="text-sm text-white/80 mb-0">Community Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white mb-0">Welcome back,</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Manage your 12Gaam community system and member data
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoadingStats ? (
            <>
              {/* Skeleton Loaders */}
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                      <div className="p-3 bg-gray-200 rounded-full animate-pulse">
                        <div className="h-6 w-6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Contacts</p>
                      <p className="text-3xl font-bold">{stats.contacts}</p>
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
                      <p className="text-green-100 text-sm font-medium">New This Month</p>
                      <p className="text-3xl font-bold">{stats.newContactsThisMonth}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Countries</p>
                      <p className="text-3xl font-bold">{stats.totalCountries}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <Building2 className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">States</p>
                      <p className="text-3xl font-bold">{stats.totalStates}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Core Management Section with List View */}
        <div className="grid grid-cols-1 lg:grid gap-10">
          {/* Left Side - Management Cards */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-800">Contact Management</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage all community contacts and member information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className={`grid grid-cols-1 ${session?.user.role === 'SUPER_ADMIN' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'} gap-6`}>
                  <Link href="/admin/contacts" className="h-full">
                    <Card className="border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                      <CardContent className="p-6 text-center flex flex-col flex-grow">
                        <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">View Contacts</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Browse and manage all community contacts</p>
                        <div className="mt-auto">
                          <div className="text-2xl font-bold text-blue-600">
                            {isLoadingStats ? (
                              <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
                            ) : (
                              stats.contacts
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Total Contacts</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/registrations" className="h-full">
                    <Card className="border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                      <CardContent className="p-6 text-center flex flex-col flex-grow">
                        <UserPlus className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Registration Requests</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Approve or reject gaam registrations</p>
                        <div className="mt-auto">
                          <div className="text-lg font-semibold text-green-600">Review requests</div>
                          <p className="text-sm text-gray-500 mt-1">Pending approvals</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {session?.user.role === 'SUPER_ADMIN' && (
                    <Link href="/admin/admins" className="h-full">
                      <Card className="border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                        <CardContent className="p-6 text-center flex flex-col flex-grow">
                          <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Admins</h3>
                          <p className="text-gray-600 text-sm mb-4 flex-grow">Create admins and assign GAAMs</p>
                          <div className="mt-auto">
                            <p className="text-sm text-gray-500">Admin management</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}

                  <Link href="/admin/contacts?filter=this_month" className="h-full">
                    <Card className="border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                      <CardContent className="p-6 text-center flex flex-col flex-grow">
                        <UserPlus className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">New Members</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Members who joined this month</p>
                        <div className="mt-auto">
                          <div className="text-2xl font-bold text-green-600">
                            {isLoadingStats ? (
                              <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
                            ) : (
                              stats.newContactsThisMonth
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">This Month</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Recent Contacts List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="text-lg font-semibold text-blue-800">Recent Contacts</CardTitle>
                <CardDescription className="text-blue-600">
                  Latest community members
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {isLoadingStats ? (
                    <div className="text-center py-8">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
                    </div>
                  ) : stats.contacts > 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">View all {stats.contacts} contacts</p>
                      <Link href="/admin/contacts">
                        <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                          View All
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No contacts yet</p>
                      <p className="text-xs text-gray-500">Start building your community</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status Card */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <CardTitle className="text-lg font-semibold text-purple-800">System Status</CardTitle>
              <CardDescription className="text-purple-600">
                Geographic coverage and system information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  {isLoadingStats ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto mt-2"></div>
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">{stats.totalCountries}</p>
                  )}
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">States</p>
                  {isLoadingStats ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto mt-2"></div>
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">{stats.totalStates}</p>
                  )}
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Coverage</p>
                  {isLoadingStats ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-8 mx-auto mt-2"></div>
                  ) : (
                    <p className="text-lg font-semibold text-purple-600">
                      {stats.totalCountries > 0 && stats.totalStates > 0
                        ? `${Math.round((stats.totalStates / (stats.totalCountries * 10)) * 100)}%`
                        : '0%'
                      }
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


      </main>
    </div>
  )
}
