import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSuperAdmin } from '@/lib/rbac'

// PUT - Assign or update GAAM assignments for an admin (supports multiple gaams)
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
    let { gaamIds } = body // Now accepts array of gaamIds

    // Verify admin exists and is a GAAM_ADMIN
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
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
      }
    })

    if (!admin || admin.role !== 'GAAM_ADMIN') {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // If gaamIds is null, empty array, or not provided, remove all GAAM assignments
    if (!gaamIds || !Array.isArray(gaamIds) || gaamIds.length === 0) {
      await prisma.gaamAdmin.deleteMany({
        where: { adminId: adminId }
      })

      return NextResponse.json({ message: 'GAAM assignments removed' })
    }

    // Filter out invalid IDs (single characters, "none", empty strings, etc.)
    // Valid Prisma CUIDs start with 'c' and are typically 25 characters long
    const validGaamIds = gaamIds.filter((id: any) => {
      return (
        typeof id === 'string' &&
        id.length > 10 && // Filter out short strings like "n", "o", "none"
        id !== 'none' &&
        id.trim() !== ''
      )
    })

    if (validGaamIds.length === 0) {
      // If no valid IDs, remove all assignments
      await prisma.gaamAdmin.deleteMany({
        where: { adminId: adminId }
      })
      return NextResponse.json({ message: 'GAAM assignments removed' })
    }

    // Verify all GAAMs exist
    const gaams = await prisma.gaam.findMany({
      where: { id: { in: validGaamIds } }
    })

    if (gaams.length !== validGaamIds.length) {
      return NextResponse.json({ 
        error: 'One or more GAAMs not found',
        details: `Found ${gaams.length} out of ${validGaamIds.length} requested GAAMs`
      }, { status: 404 })
    }

    // Remove existing assignments for this admin
    await prisma.gaamAdmin.deleteMany({
      where: { adminId: adminId }
    })

    // Create new assignments
    await prisma.gaamAdmin.createMany({
      data: validGaamIds.map((gaamId: string) => ({
        gaamId,
        adminId
      }))
    })

    // Return updated admin with GAAMs
    const updatedAdmin = await prisma.user.findUnique({
      where: { id: adminId },
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
      }
    })

    // Transform to match expected format
    const formattedAdmin = {
      ...updatedAdmin,
      gaamsManaged: updatedAdmin?.gaamsManaged.map(gm => gm.gaam) || []
    }

    return NextResponse.json(formattedAdmin)
  } catch (error) {
    console.error('Error updating GAAM assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

