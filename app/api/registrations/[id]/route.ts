import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminRole, isSuperAdmin } from '@/lib/rbac'
import { RegistrationStatus, UserRole } from '@prisma/client'
import { sendRegistrationStatusEmail } from '@/lib/mailer'
import { generateRandomPassword } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const status = body?.status as RegistrationStatus
    const notes = body?.notes as string | undefined

    if (!status || !Object.values(RegistrationStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (status === RegistrationStatus.PENDING) {
      return NextResponse.json({ error: 'Cannot revert to pending' }, { status: 400 })
    }

    const registration = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        gaam: true
      }
    })

    if (!registration || registration.role !== UserRole.MEMBER) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (!registration.gaamId) {
      return NextResponse.json({ error: 'Registration missing gaam assignment' }, { status: 400 })
    }

    let adminId = session.user.id
    if (!adminId && session.user.email) {
      const adminUser = await prisma.user.findFirst({
        where: { email: { equals: session.user.email, mode: 'insensitive' } },
        select: { id: true }
      })
      if (adminUser) {
        adminId = adminUser.id
      }
    }

    if (!isSuperAdmin(session.user.role)) {
      if (!adminId) {
        return NextResponse.json({ error: 'Admin identity could not be verified' }, { status: 403 })
      }

      // Check if the admin is assigned to this gaam
      const gaamAdmin = await prisma.gaamAdmin.findFirst({
        where: {
          gaamId: registration.gaamId,
          adminId
        }
      })

      if (!gaamAdmin) {
        return NextResponse.json({ error: 'Not authorized for this gaam' }, { status: 403 })
      }
    }

    const isApproved = status === RegistrationStatus.APPROVED
    let plainPassword = ''

    if (isApproved) {
      plainPassword = generateRandomPassword(10)
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        status,
        verificationNotes: notes,
        verifiedAt: new Date(),
        verifiedById: adminId || null,
        ...(isApproved ? { password: await bcrypt.hash(plainPassword, 12) } : {})
      },
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

    try {
      await sendRegistrationStatusEmail({
        to: updated.email,
        name: updated.fullName,
        status: isApproved ? 'Approved' : 'Rejected',
        username: isApproved ? updated.username : undefined,
        notes
      })
    } catch (emailError) {
      console.error('Failed to send registration status email:', emailError)
      // Allow the status update to succeed even if email delivery fails
    }

    return NextResponse.json({ registration: updated })
  } catch (error) {
    console.error('Error updating registration:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Internal server error',
      message: errorMessage
    }, { status: 500 })
  }
}

