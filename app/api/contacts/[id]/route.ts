import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { contactFormSchema } from '@/lib/validations';
import { isAdminRole, isSuperAdmin } from '@/lib/rbac';

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

    const isOwner = contact.userId && contact.userId === session.user.id;
    if (!isOwner && !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    const existingContact = await prisma.contact.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const isOwner = existingContact.userId && existingContact.userId === session.user.id;
    if (!isOwner && !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
          spouseFirstName: validatedData.spouseFirstName,
          spouseMiddleName: validatedData.spouseMiddleName,
          spouseLastName: validatedData.spouseLastName,
          fatherFirstName: validatedData.fatherFirstName,
          fatherMiddleName: validatedData.fatherMiddleName,
          fatherLastName: validatedData.fatherLastName,
          motherFirstName: validatedData.motherFirstName,
          motherMiddleName: validatedData.motherMiddleName,
          motherLastName: validatedData.motherLastName,
          gender: validatedData.gender as any,
          maritalStatus: validatedData.maritalStatus,
          is18Plus: validatedData.is18Plus,
          gaam: validatedData.gaam,
          currentAddress: validatedData.currentAddress,
          countryId: validatedData.countryId,
          stateId: validatedData.stateId,
          cityId: validatedData.cityId,
          phone: validatedData.phone,
          countryCode: validatedData.countryCode,
          email: validatedData.email,
          dob: validatedData.dob ? new Date(validatedData.dob) : null,
          educationId: validatedData.educationId,
          otherEducation: validatedData.otherEducation,
          professionId: validatedData.professionId,
          otherProfession: validatedData.otherProfession,
          website: validatedData.website,
          profilePic: validatedData.profilePic,
          familyPhoto: validatedData.familyPhoto,
          children: {
            create: validatedData.children.map(child => ({
              firstName: child.firstName || '',
              middleName: child.middleName,
              lastName: child.lastName,
              gender: child.gender as any,
              age: child.age
            }))
          },
          siblings: {
            create: validatedData.siblings.map(sibling => ({
              firstName: sibling.firstName || '',
              middleName: sibling.middleName,
              lastName: sibling.lastName,
              gender: sibling.gender as any,
              age: sibling.age
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

    if (!isSuperAdmin(session.user.role)) {
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