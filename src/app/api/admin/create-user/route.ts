import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return new NextResponse('Email, password, and name are required', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN', // Define a role como ADMIN
      },
    });

    return NextResponse.json({ message: 'Admin user created successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return new NextResponse(error.message || 'Failed to create admin user', { status: 500 });
  }
}
