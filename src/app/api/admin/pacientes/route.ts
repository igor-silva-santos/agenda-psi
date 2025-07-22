import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  console.log('[PACIENTES][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PACIENTES][GET] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    console.warn('[PACIENTES][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    console.warn('[PACIENTES][GET] Sessão inválida ou usuário não é admin', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const pacientes = await prisma.user.findMany({
      where: { role: 'PACIENTE' },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        telefone: true,
        dataNascimento: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(pacientes);
  } catch (error) {
    console.error('[PACIENTES][GET] ERRO:', error);
    return new NextResponse('Erro interno ao buscar pacientes', { status: 500 });
  }
}
