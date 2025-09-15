import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/supabase-db';
import { userSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user in Supabase
    const user = await createUser({
      username: validatedData.username,
      password: hashedPassword,
      role: validatedData.role
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.created_at
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
