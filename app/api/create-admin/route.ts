import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegistrationStatus, UserRole } from '@prisma/client';

export async function POST() {
  try {
    // Hash the password 'Admin@123'
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    // Create admin user using Prisma
    const user = await prisma.user.upsert({
      where: { email: 'superadmin@12gaam.com' },
      update: {
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        status: RegistrationStatus.APPROVED
      },
      create: {
        fullName: 'Super Admin',
        email: 'superadmin@12gaam.com',
        username: 'superadmin',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        status: RegistrationStatus.APPROVED
      }
    });

    return NextResponse.json({
      message: 'Admin user created successfully',
      username: user.username,
      password: 'Admin@123',
      role: user.role,
      id: user.id
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
