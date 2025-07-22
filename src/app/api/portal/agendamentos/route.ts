import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  console.log('[PORTAL-AGENDAMENTOS][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PORTAL-AGENDAMENTOS][GET] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    console.warn('[PORTAL-AGENDAMENTOS][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PACIENTE') {
    console.warn('[PORTAL-AGENDAMENTOS][GET] Sessão inválida ou usuário não é paciente', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        dataHora: 'asc',
      },
    });
    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error('[PORTAL-AGENDAMENTOS][GET] ERRO:', error);
    return new NextResponse('Erro interno ao buscar agendamentos do paciente', { status: 500 });
  }
}
