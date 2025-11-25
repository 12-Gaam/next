import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSuperAdmin } from '@/lib/rbac'

// PUT - Assign or update GAAM assignment for an admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminId = params.id
    const body = await request.json()
    const { gaamId } = body

    // Verify admin exists and is a GAAM_ADMIN
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: { gaamsManaged: true }
    })

    if (!admin || admin.role !== 'GAAM_ADMIN') {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // If gaamId is null or empty, remove all GAAM assignments
    if (!gaamId) {
      await prisma.gaam.updateMany({
        where: { adminId: adminId },
        data: { adminId: null }
      })

      return NextResponse.json({ message: 'GAAM assignment removed' })
    }

    // Verify GAAM exists
    const gaam = await prisma.gaam.findUnique({
      where: { id: gaamId }
    })

    if (!gaam) {
      return NextResponse.json({ error: 'GAAM not found' }, { status: 404 })
    }

    // Check if GAAM is already assigned to another admin
    if (gaam.adminId && gaam.adminId !== adminId) {
      return NextResponse.json(
        { error: 'This GAAM is already assigned to another admin' },
        { status: 400 }
      )
    }

    // Remove existing assignments for this admin
    await prisma.gaam.updateMany({
      where: { adminId: adminId },
      data: { adminId: null }
    })

    // Assign new GAAM
    await prisma.gaam.update({
      where: { id: gaamId },
      data: { adminId: adminId }
    })

    // Return updated admin with GAAMs
    const updatedAdmin = await prisma.user.findUnique({
      where: { id: adminId },
      include: {
        gaamsManaged: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(updatedAdmin)
  } catch (error) {
    console.error('Error updating GAAM assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

