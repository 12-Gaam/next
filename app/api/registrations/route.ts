import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { registrationSchema } from '@/lib/validations'
import { generateRandomPassword, usernameFromEmail } from '@/lib/utils'
import { sendRegistrationCredentialsEmail } from '@/lib/mailer'
import { isAdminRole, isSuperAdmin } from '@/lib/rbac'
import { RegistrationStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const gaamParam = searchParams.get('gaamId')

    let statusFilter: RegistrationStatus | undefined
    if (statusParam && Object.values(RegistrationStatus).includes(statusParam as RegistrationStatus)) {
      statusFilter = statusParam as RegistrationStatus
    }

    let gaamFilter: string[] | undefined

    if (isSuperAdmin(session.user.role)) {
      if (gaamParam) {
        gaamFilter = [gaamParam]
      }
    } else {
      const gaams = await prisma.gaam.findMany({
        where: { adminId: session.user.id },
        select: { id: true }
      })
      gaamFilter = gaams.map((gaam) => gaam.id)

      if (!gaamFilter.length) {
        return NextResponse.json({ registrations: [] })
      }
    }

    const registrations = await prisma.user.findMany({
      where: {
        role: UserRole.MEMBER,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(gaamFilter ? { gaamId: { in: gaamFilter } } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        gaam: true,
        verifiedBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registrationSchema.parse(body)

    const gaam = await prisma.gaam.findUnique({
      where: { id: validatedData.gaamId }
    })

    if (!gaam) {
      return NextResponse.json({ error: 'Invalid Gaam selection' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { username: validatedData.email }]
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already registered with this email' }, { status: 409 })
    }

    const baseUsername = usernameFromEmail(validatedData.email)
    let username = baseUsername
    let counter = 1

    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter++}`
    }

    const password = generateRandomPassword(10)
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        username,
        password: hashedPassword,
        role: UserRole.MEMBER,
        status: RegistrationStatus.PENDING,
        gaamId: validatedData.gaamId
      }
    })

    try {
      await sendRegistrationCredentialsEmail({
        to: user.email,
        name: user.fullName,
        username: user.username,
        password
      })
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError)
      // Don't fail the whole request if email delivery fails
    }

    return NextResponse.json({ message: 'Registration submitted successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.message 
      }, { status: 400 })
    }

    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    }, { status: 500 })
  }
}

