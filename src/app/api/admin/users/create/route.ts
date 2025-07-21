import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return new NextResponse('Email, password, name, and role are required', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    return NextResponse.json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new NextResponse(error.message || 'Failed to create user', { status: 500 });
  }
}
