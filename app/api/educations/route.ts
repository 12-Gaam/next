import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { masterDataSchema } from '@/lib/validations';
import { isSuperAdmin } from '@/lib/rbac';

export async function GET() {
  try {
    const educations = await prisma.educationMaster.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(educations);
  } catch (error) {
    console.error('Error fetching educations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = masterDataSchema.parse(body);

    const education = await prisma.educationMaster.create({
      data: validatedData
    });

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating education:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
