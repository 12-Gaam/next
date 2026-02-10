'use client'

import React from 'react'
import HeaderPage from '@/components/common/HeaderPage'
import FooterPage from '@/components/common/FooterPage'
import { FileText, ShieldCheck, Scale, AlertCircle } from 'lucide-react'

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <HeaderPage />

      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white shadow-xl border border-amber-100/20">
              <FileText className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-primary mb-4">
              Terms & <span className="text-secondary">Conditions</span>
            </h1>
            <p className="text-slate-500 text-lg">Last updated: February 2026</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            <section className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-bold text-primary">1. Acceptances of Terms</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                By accessing and using the 12Gaam Community Portal, you agree to be bound by these Terms and Conditions. Our platform is designed to connect and empower our community villages. If you do not agree with any part of these terms, please discontinue use of the portal.
              </p>
            </section>

            <section className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-bold text-primary">2. User Conduct & Responsibilities</h2>
              </div>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-4">
                  <div className="min-w-[6px] h-[6px] rounded-full bg-secondary mt-2.5"></div>
                  <span>Users must provide accurate and truthful information during registration.</span>
                </li>
                <li className="flex gap-4">
                  <div className="min-w-[6px] h-[6px] rounded-full bg-secondary mt-2.5"></div>
                  <span>Account security is the responsibility of the user; do not share OTPs or passwords.</span>
                </li>
                <li className="flex gap-4">
                  <div className="min-w-[6px] h-[6px] rounded-full bg-secondary mt-2.5"></div>
                  <span>Respectful communication is mandatory within all community forums and features.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-bold text-primary">3. Data Privacy & Verification</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Registration details are subject to verification by your respective Gaam Admin. We prioritize your privacy and will only use your data for community management and essential communication.
              </p>
              <p className="text-slate-600 leading-relaxed">
                For complete details on how we handle your data, please refer to our Gaam Admin.
              </p>
            </section>

            <div className="text-center pt-8 text-slate-400 text-sm italic">
              "Twelve Villages, One Community."
            </div>
          </div>
        </div>
      </main>

      <FooterPage />
    </div>
  )
}