import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');

    console.log('Cities API called with stateId:', stateId);

    if (!stateId) {
      return NextResponse.json({ error: 'State ID is required' }, { status: 400 });
    }

    // Get cities for the specified state from database
    const cities = await prisma.cityMaster.findMany({
      where: { stateId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true
      }
    });
    
    console.log(`Found ${cities.length} cities for stateId: ${stateId}`);
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
