import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PACIENTE') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        dataHora: 'desc', // Mais recentes primeiro
      },
    });
    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos do usuário:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
