'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Loader2, User, Key, Mail, Shield, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export default function AdminProfile() {
  const { data: session, update, status } = useSession()
  const router = useRouter()

  const [profilePicLoading, setProfilePicLoading] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profilePic) {
            setProfilePic(data.profilePic)
          }
        })
        .catch(console.error)
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProfilePicLoading(true)
    setError('')
    setSuccess('')

    try {
      // 1. Upload the image to the general upload endpoint
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'admin_profiles')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Failed to upload image')

      const uploadData = await uploadRes.json()
      const newImageUrl = uploadData.url 

      // 2. Update the user profile
      const updateRes = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePic: newImageUrl }),
      })

      if (!updateRes.ok) throw new Error('Failed to update profile picture')

      // Update local state
      setProfilePic(newImageUrl)
      setSuccess('Profile picture updated successfully. Refresh the page to see it everywhere.')

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setProfilePicLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-500 mt-2">Manage your account details and profile picture.</p>
        </div>
        <Link href="/admin/change-password">
          <Button className="flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm border border-green-200">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card className="p-6 md:col-span-1 flex flex-col items-center justify-center space-y-6">
          <div className="relative group cursor-pointer">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-20 h-20 text-gray-400" />
              )}
            </div>
            
            <label 
              htmlFor="profile-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {profilePicLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </label>
            <input 
              id="profile-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={profilePicLoading}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            Click the image to upload a new profile picture.
          </p>
        </Card>

        {/* Profile Details Card */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-6 border-b pb-4">Account Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Full Name</p>
                <p className="text-gray-900 font-semibold">{session.user.fullName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email Address</p>
                <p className="text-gray-900 font-semibold">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Role</p>
                <p className="text-gray-900 font-semibold">{session.user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
