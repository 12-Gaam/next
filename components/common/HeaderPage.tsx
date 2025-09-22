import { UsersRound } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function HeaderPage() {
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
            <div className="flex items-center"> 
              <Link href="/dashboard" className="bg-secondary hover:bg-secondary/90 text-white px-6 py-4 rounded-lg flex items-center gap-2">
              <UsersRound size={20} />
                  Join Community
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default HeaderPage