import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/mailer'
import { RegistrationStatus, UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier } = body // email or username

    if (!identifier) {
      return NextResponse.json({ error: 'Email or username is required' }, { status: 400 })
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: 'If the email/username exists, an OTP has been sent' 
      }, { status: 200 })
    }

    // Only allow OTP for MEMBER role users with APPROVED status
    if (user.role !== UserRole.MEMBER || user.status !== RegistrationStatus.APPROVED) {
      return NextResponse.json({ 
        message: 'If the email/username exists, an OTP has been sent' 
      }, { status: 200 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Update user with OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiresAt
      }
    })

    // Send OTP email
    try {
      await sendOTPEmail({
        to: user.email,
        name: user.fullName,
        otp
      })
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'OTP has been sent to your email' 
    }, { status: 200 })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

