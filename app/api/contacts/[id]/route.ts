import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { contactFormSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        country: true,
        state: true,
        education: true,
        profession: true,
        children: true,
        siblings: true
      }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = contactFormSchema.parse(body);

    // Delete existing children and siblings
    await Promise.all([
      prisma.contactChild.deleteMany({ where: { contactId: params.id } }),
      prisma.contactSibling.deleteMany({ where: { contactId: params.id } })
    ]);

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
          firstname: validatedData.firstname,
          middlename: validatedData.middlename,
          lastname: validatedData.lastname,
          spouseName: validatedData.spouseName,
          fatherName: validatedData.fatherName,
          motherName: validatedData.motherName,
          gender: validatedData.gender as any,
          gaam: validatedData.gaam,
          currentAddress: validatedData.currentAddress,
          country: validatedData.countryId ? { connect: { id: validatedData.countryId } } : { disconnect: true },
          state: validatedData.stateId ? { connect: { id: validatedData.stateId } } : { disconnect: true },
          city: validatedData.cityId ? { connect: { id: validatedData.cityId } } : { disconnect: true },
          phone: validatedData.phone,
          email: validatedData.email,
          dob: new Date(validatedData.dob || ''),
          educationId: validatedData.educationId,
          otherEducation: validatedData.otherEducation,
          professionId: validatedData.professionId,
          otherProfession: validatedData.otherProfession,
          website: validatedData.website,
          profilePic: validatedData.profilePic,
          familyPhoto: validatedData.familyPhoto,
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
        } as any,
      include: {
        country: true,
        state: true,
        education: true,
        profession: true,
        children: true,
        siblings: true
      }
    });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.contact.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
