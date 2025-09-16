import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Hash the password 'Admin@123'
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    // Create admin user using Prisma
    const user = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        role: 'admin'
      },
      create: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      }
    });

    return NextResponse.json({
      message: 'Admin user created successfully',
      username: 'admin',
      password: 'Admin@123',
      role: 'admin',
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
