import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { contactFormSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    let where: Prisma.ContactWhereInput = {};
    
    if (search) {
      where = {
        OR: [
          { firstname: { contains: search } },
          { lastname: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ]
      };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          country: true,
          state: true,
          education: true,
          profession: true,
          children: true,
          siblings: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contact.count({ where })
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Allow anyone to submit contact forms (no authentication required)
    // Only admin users can view contacts

    const body = await request.json();
    
    const validatedData = contactFormSchema.parse(body);
    const contact = await prisma.contact.create({
      data: {
        firstname: validatedData.firstname,
        middlename: validatedData.middlename || null,
        lastname: validatedData.lastname || "Patel",
        spouseName: validatedData.spouseName || null,
        fatherName: validatedData.fatherName,
        motherName: validatedData.motherName,
        gender: validatedData.gender,
        gaam: validatedData.gaam,
        currentAddress: validatedData.currentAddress,
        countryId: validatedData.countryId || null,
        stateId: validatedData.stateId || null,
        cityId: validatedData.cityId || null,
        phone: validatedData.phone,
        email: validatedData.email || '',
        dob: validatedData.dob ? new Date(validatedData.dob) : new Date(),
        educationId: validatedData.educationId || undefined,
        otherEducation: validatedData.otherEducation || undefined,
        professionId: validatedData.professionId || undefined,
        otherProfession: validatedData.otherProfession || undefined,
        website: validatedData.website || undefined,
        profilePic: validatedData.profilePic || undefined,
        familyPhoto: validatedData.familyPhoto || undefined,
        fb: validatedData.fb || undefined,
        linkedin: validatedData.linkedin || undefined,
        insta: validatedData.insta || undefined,
        tiktok: validatedData.tiktok || undefined,
        twitter: validatedData.twitter || undefined,
        snapchat: validatedData.snapchat || undefined,
        children: {
          create: validatedData.children.map(child => ({
            ...child,
            gender: child.gender as any
          }))
        },
        siblings: {
          create: validatedData.siblings.map(sibling => ({
            ...sibling,
            gender: sibling.gender as any
          }))
        }
      },
      include: {
        country: true,
        state: true,
        education: true,
        profession: true,
        children: true,
        siblings: true
      }
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating contact:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}