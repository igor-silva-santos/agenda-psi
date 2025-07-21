import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
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

  const { id } = params;

  try {
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id: String(id),
        userId: session.user.id, // Garante que o paciente só pode modificar seus próprios agendamentos
      },
    });

    if (!agendamento) {
      return new NextResponse('Agendamento não encontrado ou não autorizado', { status: 404 });
    }

    const updatedAgendamento = await prisma.agendamento.update({
      where: { id: String(id) },
      data: { status: 'CONFIRMADO' },
    });

    return NextResponse.json(updatedAgendamento);
  } catch (error) {
    console.error(`Erro ao confirmar o agendamento ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
