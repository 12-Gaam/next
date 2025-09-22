import FooterPage from '@/components/common/FooterPage'
import HeaderPage from '@/components/common/HeaderPage'
import React from 'react'

function TermsAndConditions() {
  return (
    <>
    <HeaderPage />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
          <p className="text-gray-600 mt-2">
            Terms and Conditions for the 12Gaam community. 
          </p>
        </div>
    </main>
    <FooterPage />
    </>
  )
}

export default TermsAndConditions