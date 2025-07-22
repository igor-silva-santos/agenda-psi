import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: { id: number } }) {
  try {
    const { id } = params;
    const { name, email, password, role } = await request.json();

    if (!id) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const updateData: any = {
      name,
      email,
      role,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return new NextResponse(error.message || 'Failed to update user', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
  try {
    const { id } = params;

    if (!id) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse('User deleted successfully', { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return new NextResponse(error.message || 'Failed to delete user', { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: number } }) {
  console.log('[USERS][GET][id] Início da requisição', { params });
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      console.warn('[USERS][GET][id] Usuário não encontrado', { params });
      return new NextResponse('Usuário não encontrado', { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('[USERS][GET][id] ERRO:', error);
    return new NextResponse('Erro interno ao buscar usuário', { status: 500 });
  }
}
