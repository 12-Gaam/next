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
  const [stats, setStats] = useState({
    totalContacts: 0,
    newThisMonth: 0,
    totalCountries: 0,
    totalStates: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  return (
    <>
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time analytics and community management tools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2 border border-blue-100">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoadingStats ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-20"></div>
                      <div className="h-8 bg-gray-100 rounded w-16"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Contacts</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{stats.totalContacts}</p>
                  </div>
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">New This Month</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{stats.newThisMonth}</p>
                  </div>
                  <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Countries</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{stats.totalCountries}</p>
                  </div>
                  <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">States</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{stats.totalStates}</p>
                  </div>
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/admin/contacts">
                <div className="p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group cursor-pointer h-full">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-gray-900">Directory</h4>
                  <p className="text-xs text-gray-500 mt-1">Browse all {stats.totalContacts} members</p>
                </div>
              </Link>

              <Link href="/admin/registrations">
                <div className="p-4 border border-gray-100 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group cursor-pointer h-full">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-gray-900">Approvals</h4>
                  <p className="text-xs text-gray-500 mt-1">Pending registration requests</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-bold text-gray-800">System Health</CardTitle>
            <CardDescription>Infrastructure and coverage</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Shield className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Security Protocols</p>
                    <p className="text-xs text-green-600 font-medium">Active & Secure</p>
                  </div>
                </div>
                <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Data Coverage</p>
                    <p className="text-xs text-blue-600 font-medium">
                      {stats.totalCountries} Countries / {stats.totalStates} States
                    </p>
                  </div>
                </div>
                <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-3/4"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
