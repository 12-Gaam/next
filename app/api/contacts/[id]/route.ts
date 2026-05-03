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
        children: {
          include: {
            education: true,
            profession: true
          }
        },
        siblings: {
          include: {
            country: true,
            state: true
          }
        }
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

    const contact = await prisma.$transaction(async (tx) => {
      // Delete existing children and siblings
      await tx.contactChild.deleteMany({ where: { contactId: params.id } });
      await tx.contactSibling.deleteMany({ where: { contactId: params.id } });

      return await tx.contact.update({
        where: { id: params.id },
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
          gender: validatedData.gender as any,
          maritalStatus: validatedData.maritalStatus || null,
          is18Plus: validatedData.is18Plus || false,
          gaam: validatedData.gaam,
          currentAddress: validatedData.currentAddress || '',
          countryId: validatedData.countryId || null,
          stateId: validatedData.stateId || null,
          cityId: validatedData.cityId || null,
          zipCode: validatedData.zipCode || null,
          phone: validatedData.phone,
          countryCode: validatedData.countryCode || '+1',
          email: validatedData.email || '',
          educationId: validatedData.educationId || null,
          educationDetail: validatedData.educationDetail || null,
          otherEducation: validatedData.otherEducation || null,
          professionId: validatedData.professionId || null,
          otherProfession: validatedData.otherProfession || null,
          website: validatedData.website || null,
          profilePic: validatedData.profilePic || null,
          familyPhoto: validatedData.familyPhoto || null,
          residingCountryId: validatedData.residingCountryId || null,
          dob: validatedData.dob ? new Date(validatedData.dob) : null,
          children: {
            create: validatedData.children.map(child => ({
              firstName: child.firstName || '',
              middleName: child.middleName || null,
              lastName: child.lastName || null,
              gender: child.gender as any,
              dob: child.dob || null,
              educationId: child.educationId || null,
              educationDetail: child.educationDetail || null,
              otherEducation: child.otherEducation || null,
              professionId: child.professionId || null,
              otherProfession: child.otherProfession || null
            }))
          },
          siblings: {
            create: validatedData.siblings.map(sibling => ({
              firstName: sibling.firstName || '',
              middleName: sibling.middleName || null,
              lastName: sibling.lastName || null,
              gender: sibling.gender as any,
              dob: sibling.dob || null,
              currentAddress: sibling.currentAddress || null,
              countryId: sibling.countryId || null,
              stateId: sibling.stateId || null,
              cityId: sibling.cityId || null,
              zipCode: sibling.zipCode || null
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
    });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      const formattedErrors = zodError.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json(
        { error: 'Validation error', details: formattedErrors },
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