import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

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
