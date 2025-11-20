import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { contactFormSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { isAdminRole } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const ownership = searchParams.get('ownership');

    if (ownership === 'me') {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const contact = await prisma.contact.findFirst({
        where: { userId: session.user.id },
        include: {
          country: true,
          state: true,
          education: true,
          profession: true,
          children: true,
          siblings: true
        }
      });

      return NextResponse.json({ contact });
    }

    if (!session || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    let where: Prisma.ContactWhereInput = {};
    
    if (search) {
      where = {
        OR: [
          { firstname: { contains: search } },
          { middlename: { contains: search } },
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
    const session = await getServerSession(authOptions).catch(() => null);

    const body = await request.json();
    
    const validatedData = contactFormSchema.parse(body);
    if (session?.user?.id) {
      const existingContact = await prisma.contact.findFirst({
        where: { userId: session.user.id }
      });

      if (existingContact) {
        return NextResponse.json(
          { error: 'Family profile already exists for this user' },
          { status: 400 }
        );
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstname: validatedData.firstname,
        middlename: validatedData.middlename || null,
        lastname: validatedData.lastname || null,
        spouseFirstName: validatedData.spouseFirstName || null,
        spouseMiddleName: validatedData.spouseMiddleName || null,
        spouseLastName: validatedData.spouseLastName || null,
        fatherFirstName: validatedData.fatherFirstName || '',
        fatherMiddleName: validatedData.fatherMiddleName || null,
        fatherLastName: validatedData.fatherLastName || null,
        motherFirstName: validatedData.motherFirstName || '',
        motherMiddleName: validatedData.motherMiddleName || null,
        motherLastName: validatedData.motherLastName || null,
        gender: validatedData.gender,
        maritalStatus: validatedData.maritalStatus || null,
        is18Plus: validatedData.is18Plus || false,
        gaam: validatedData.gaam,
        currentAddress: validatedData.currentAddress,
        countryId: validatedData.countryId || null,
        stateId: validatedData.stateId || null,
        cityId: validatedData.cityId || null,
        phone: validatedData.phone,
        countryCode: validatedData.countryCode || '+1',
        email: validatedData.email || '',
        dob: validatedData.dob ? new Date(validatedData.dob) : new Date(),
        educationId: validatedData.educationId,
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
        userId: session?.user?.id,
        children: {
          create: validatedData.children.map(child => ({
            firstName: child.firstName || '',
            middleName: child.middleName || null,
            lastName: child.lastName || null,
            gender: child.gender as any,
            age: child.age
          }))
        },
        siblings: {
          create: validatedData.siblings.map(sibling => ({
            firstName: sibling.firstName || '',
            middleName: sibling.middleName || null,
            lastName: sibling.lastName || null,
            gender: sibling.gender as any,
            age: sibling.age
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