import { NextResponse } from 'next/server';
import { createUser } from '@/lib/supabase-db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Hash the password 'Admin@123'
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    // Create admin user
    const user = await createUser({
      username: 'admin',
      password_hash: hashedPassword,
      role: 'admin'
    });

    return NextResponse.json({
      message: 'Admin user created successfully',
      username: 'admin',
      password: 'Admin@123',
      role: 'admin'
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
