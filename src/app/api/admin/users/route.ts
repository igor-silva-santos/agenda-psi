import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  console.log('[USERS][GET] Início da requisição');
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('[USERS][GET] ERRO:', error);
    return new NextResponse('Erro interno ao buscar usuários', { status: 500 });
  }
}