import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'antd/dist/reset.css'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '12Gaam - Contact Management System',
  description: 'A comprehensive contact management system for the 12Gaam community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
