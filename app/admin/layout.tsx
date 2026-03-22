'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Users, UserPlus, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const allowedRoles = ['SUPER_ADMIN', 'GAAM_ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  if (!session) return null

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Contacts', href: '/admin/contacts', icon: Users },
    { name: 'Registrations', href: '/admin/registrations', icon: UserPlus },
    ...(session.user.role === 'SUPER_ADMIN' ? [{ name: 'Admins', href: '/admin/admins', icon: Shield }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white leading-tight">12Gaam Admin</span>
                <span className="text-xs text-white/70 uppercase tracking-widest font-medium">Management System</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-secondary' : 'text-white/40'}`} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-0">Logged in as</p>
                <p className="text-sm font-bold text-white mb-0">{session.user.username}</p>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                variant="ghost"
                className="flex items-center space-x-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/10 transition-all px-4"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
