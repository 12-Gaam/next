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
  BarChart3
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

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
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

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  12Gaam Admin
                </span>
                <p className="text-sm text-gray-500">Community Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome back,</p>
                <p className="text-sm text-gray-600">{session.user.username}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 border-2 border-gray-200 hover:border-red-500 hover:text-red-600 transition-colors"
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Manage your 12Gaam community system and member data
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        </div>

                 {/* Core Management Section with List View */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Link href="/admin/contacts">
                     <Card className="border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
                       <CardContent className="p-6 text-center">
                         <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                         <h3 className="text-lg font-semibold text-gray-800 mb-2">View Contacts</h3>
                         <p className="text-gray-600 text-sm">Browse and manage all community contacts</p>
                         <div className="mt-4 text-2xl font-bold text-blue-600">{stats.contacts}</div>
                         <p className="text-sm text-gray-500">Total Contacts</p>
                       </CardContent>
                     </Card>
                   </Link>

                   <div className="border-2 border-gray-200 rounded-lg p-6 text-center bg-gray-50">
                     <UserPlus className="h-12 w-12 text-green-600 mx-auto mb-4" />
                     <h3 className="text-lg font-semibold text-gray-800 mb-2">New Members</h3>
                     <p className="text-gray-600 text-sm">Members who joined this month</p>
                     <div className="mt-4 text-2xl font-bold text-green-600">{stats.newContactsThisMonth}</div>
                     <p className="text-sm text-gray-500">This Month</p>
                   </div>
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
                   {stats.contacts > 0 ? (
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

      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">12Gaam Community</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Connecting families and friends across the 12Gaam community worldwide. 
                Building stronger relationships and fostering community growth through meaningful connections.
              </p>
            </div>

            {/* Community Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Community</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Total Members:</span>
                  <span className="font-semibold text-white">{stats.contacts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Countries:</span>
                  <span className="font-semibold text-white">{stats.totalCountries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regions:</span>
                  <span className="font-semibold text-white">{stats.totalStates}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Members:</span>
                  <span className="font-semibold text-green-400">{stats.newContactsThisMonth}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">
                © 2025 12Gaam Community. All rights reserved.
              </div>
              <div className="text-xs text-gray-500">
                Bringing families together, one connection at a time
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
