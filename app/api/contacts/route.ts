import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { contactFormSchema } from '@/lib/validations';

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
    
    // Sanitize foreign key IDs - convert empty strings to null
    const sanitizedData = {
      ...validatedData,
      countryId: validatedData.countryId && validatedData.countryId.trim() !== '' ? validatedData.countryId : null,
      stateId: validatedData.stateId && validatedData.stateId.trim() !== '' ? validatedData.stateId : null,
      cityId: validatedData.cityId && validatedData.cityId.trim() !== '' ? validatedData.cityId : null,
      educationId: validatedData.educationId && validatedData.educationId.trim() !== '' ? validatedData.educationId : null,
      professionId: validatedData.professionId && validatedData.professionId.trim() !== '' ? validatedData.professionId : null,
    };
    
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
        countryId: sanitizedData.countryId,
        stateId: sanitizedData.stateId,
        cityId: sanitizedData.cityId,
        phone: validatedData.phone,
        email: validatedData.email || '',
        dob: validatedData.dob ? new Date(validatedData.dob) : new Date(),
        educationId: sanitizedData.educationId,
        otherEducation: validatedData.otherEducation || null,
        professionId: sanitizedData.professionId,
        otherProfession: validatedData.otherProfession || null,
        website: validatedData.website || null,
        profilePic: validatedData.profilePic || null,
        familyPhoto: validatedData.familyPhoto || null,
        fb: validatedData.fb || null,
        linkedin: validatedData.linkedin || null,
        insta: validatedData.insta || null,
        tiktok: validatedData.tiktok || null,
        twitter: validatedData.twitter || null,
        snapchat: validatedData.snapchat || null,
        children: {
          create: validatedData.children.map(child => ({
            firstname: child.firstname,
            gender: child.gender,
            age: child.age
          }))
        },
        siblings: {
          create: validatedData.siblings.map(sibling => ({
            name: sibling.name,
            gender: sibling.gender,
            age: sibling.age
          }))
        }
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
    
    // Handle foreign key constraint errors with more specific messages
    if (error instanceof Error && error.message.includes('Foreign key constraint violated')) {
      if (error.message.includes('Contact_countryId_fkey')) {
        return NextResponse.json(
          { error: 'Invalid country selected', details: 'The selected country does not exist. Please select a valid country or leave it empty.' },
          { status: 400 }
        );
      }
      if (error.message.includes('Contact_stateId_fkey')) {
        return NextResponse.json(
          { error: 'Invalid state selected', details: 'The selected state does not exist. Please select a valid state or leave it empty.' },
          { status: 400 }
        );
      }
      if (error.message.includes('Contact_cityId_fkey')) {
        return NextResponse.json(
          { error: 'Invalid city selected', details: 'The selected city does not exist. Please select a valid city or leave it empty.' },
          { status: 400 }
        );
      }
      if (error.message.includes('Contact_educationId_fkey')) {
        return NextResponse.json(
          { error: 'Invalid education selected', details: 'The selected education does not exist. Please select a valid education or leave it empty.' },
          { status: 400 }
        );
      }
      if (error.message.includes('Contact_professionId_fkey')) {
        return NextResponse.json(
          { error: 'Invalid profession selected', details: 'The selected profession does not exist. Please select a valid profession or leave it empty.' },
          { status: 400 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
