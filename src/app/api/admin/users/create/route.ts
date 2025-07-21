import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password, name, role, cpf, dataNascimento, telefone } = await request.json();

    if (!email || !password || !name || !role || !cpf || !dataNascimento || !telefone) {
      return new NextResponse('Email, password, name, role, cpf, dataNascimento e telefone são obrigatórios', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        cpf,
        dataNascimento: new Date(dataNascimento),
        telefone,
      },
    });

    return NextResponse.json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new NextResponse(error.message || 'Failed to create user', { status: 500 });
  }
}
