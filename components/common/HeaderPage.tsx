'use client'

import { LogIn, UsersRound, LogOut, User, LayoutDashboard, UserCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import React from 'react'

function HeaderPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = React.useState<string>('dashboard')

  const updateActiveTab = React.useCallback(() => {
    const hash = window.location.hash
    if (hash === '#profile') {
      setActiveTab('profile')
    } else if (hash === '#family') {
      setActiveTab('family')
    } else {
      setActiveTab('dashboard')
    }
  }, [])

  React.useEffect(() => {
    updateActiveTab()

    const handleHashChange = () => {
      updateActiveTab()
    }

    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [updateActiveTab])

  const handleTabClick = (tab: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setActiveTab(tab)

    if (tab === 'dashboard') {
      window.history.replaceState(null, '', '/dashboard')
    } else {
      window.history.replaceState(null, '', `/dashboard#${tab}`)
    }

    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }

  return (
    <>    
    <header className="bg-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center w-20">
              
              <Link href="/">
              <span className="text-2xl font-bold text-white">12Gaam</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {!session ? (
                <>
                  <Link href="/join#login" className="bg-transparent hover:bg-white hover:text-primary text-white px-4 py-3 rounded-lg flex items-center gap-2">
                    <LogIn size={20} />
                    Sign In
                  </Link>
                  <Link href="/join#registration" className="bg-secondary hover:bg-secondary/90 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                    <UsersRound size={20} />
                    Join Community
                  </Link>
                </>
              ) : (
                <>
                  {/* <Link href="/dashboard" className="bg-transparent hover:bg-white hover:text-primary text-white px-4 py-3 rounded-lg flex items-center gap-2">
                    <User size={20} />
                    Dashboard
                  </Link> */}
                  <button
                    onClick={() => {
                      // Redirect admins to admin login, normal users to dashboard
                      const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'GAAM_ADMIN'
                      signOut({ callbackUrl: isAdmin ? '/auth/signin' : '/dashboard' })
                    }}
                    className="bg-transparent hover:bg-white hover:text-primary text-white px-4 py-3 rounded-lg flex items-center gap-2"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {session && (
        <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-8">
              <a
                href="/dashboard"
                onClick={(e) => handleTabClick('dashboard', e)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'border-secondary bg-secondary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary hover:border-gray-300'
                }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </a>
              <a
                href="/dashboard#profile"
                onClick={(e) => handleTabClick('profile', e)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-secondary bg-secondary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary hover:border-gray-300'
                }`}
              >
                <UserCircle size={18} />
                My Profile
              </a>
              <a
                href="/dashboard#family"
                onClick={(e) => handleTabClick('family', e)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'family'
                    ? 'border-secondary bg-secondary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary hover:border-gray-300'
                }`}
              >
                <Users size={18} />
                Family
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default HeaderPage