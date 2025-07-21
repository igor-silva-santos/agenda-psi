import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
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

  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const range = searchParams.get('range'); // 'day', 'week', 'month'

  const where: any = {};

  if (status) {
    where.status = status;
  }

  const now = new Date();
  if (range) {
    let startDate, endDate;
    if (range === 'day') {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
    } else if (range === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else if (range === 'month') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }
    where.dataHora = {
      gte: startDate,
      lte: endDate,
    };
  }

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        user: true, // Inclui os dados do user associado
      },
      orderBy: {
        dataHora: 'asc', // Ordena por data e hora
      },
    });
    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
