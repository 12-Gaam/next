import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { masterDataSchema } from '@/lib/validations';

export async function GET() {
  try {
    const professions = await prisma.professionMaster.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(professions);
  } catch (error) {
    console.error('Error fetching professions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = masterDataSchema.parse(body);

    const profession = await prisma.professionMaster.create({
      data: validatedData
    });

    return NextResponse.json(profession, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating profession:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
