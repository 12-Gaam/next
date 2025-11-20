import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { isSuperAdmin } from '@/lib/rbac'

export async function GET() {
  try {
    const gaams = await prisma.gaam.findMany({
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(gaams)
  } catch (error) {
    console.error('Error fetching gaams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const name = (body?.name as string)?.trim()
    const adminId = body?.adminId as string | undefined

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const slugBase = slugify(name)
    let slug = slugBase
    let counter = 1

    while (await prisma.gaam.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter++}`
    }

    const gaam = await prisma.gaam.create({
      data: {
        name,
        slug,
        ...(adminId
          ? {
              admin: {
                connect: { id: adminId }
              }
            }
          : {})
      },
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(gaam, { status: 201 })
  } catch (error) {
    console.error('Error creating gaam:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

