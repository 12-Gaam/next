import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

// Test endpoint to verify admin creation and authentication
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user in Prisma (same as auth.ts does)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: email },
          { email: email }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found in Prisma database',
        foundInPrisma: false
      })
    }

    // Check if user is admin
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.GAAM_ADMIN) {
      return NextResponse.json({
        success: false,
        message: 'User is not an admin',
        foundInPrisma: true,
        userRole: user.role
      })
    }

    // Verify password (same as auth.ts does)
    const isPasswordValid = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      success: isPasswordValid,
      foundInPrisma: true,
      userExists: true,
      isAdmin: true,
      passwordValid: isPasswordValid,
      userDetails: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        hasPassword: !!user.password,
        passwordHashLength: user.password?.length
      },
      message: isPasswordValid 
        ? 'Admin user found and password is valid - authentication should work!'
        : 'Admin user found but password is invalid'
    })
  } catch (error) {
    console.error('Error testing admin auth:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

