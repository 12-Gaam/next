import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole, RegistrationStatus } from '@prisma/client'
import { isSuperAdmin } from '@/lib/rbac'
import { sendAdminCredentialsEmail } from '@/lib/mailer'

// GET - Fetch all admins with their GAAM assignments
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admins = await prisma.user.findMany({
      where: {
        role: UserRole.GAAM_ADMIN
      },
      include: {
        gaamsManaged: {
          include: {
            gaam: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match expected format (extract gaam from GaamAdmin wrapper)
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      gaamsManaged: admin.gaamsManaged.map(gm => gm.gaam)
    }))

    return NextResponse.json(formattedAdmins)
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new admin user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { fullName, email, username, password } = body

    if (!fullName || !email || !username || !password) {
      return NextResponse.json(
        { error: 'Full name, email, username, and password are required' },
        { status: 400 }
      )
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Creating admin user:', { email, username, role: UserRole.GAAM_ADMIN })

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        fullName,
        email,
        username,
        password: hashedPassword,
        role: UserRole.GAAM_ADMIN,
        status: RegistrationStatus.APPROVED
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true
      }
    })
    
    console.log('Admin user created successfully:', { id: admin.id, email: admin.email, username: admin.username, role: admin.role })

    // Send email with credentials
    try {
      await sendAdminCredentialsEmail({
        to: admin.email,
        name: admin.fullName,
        username: admin.username,
        password: password // Send the plain password from request body
      })
      console.log(`Admin credentials email sent successfully to ${admin.email}`)
    } catch (emailError) {
      console.error('Failed to send admin credentials email:', emailError)
      console.error('Email error details:', emailError instanceof Error ? emailError.message : String(emailError))
      // Don't fail the whole request if email delivery fails
      // Log the error but still return success
    }

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

