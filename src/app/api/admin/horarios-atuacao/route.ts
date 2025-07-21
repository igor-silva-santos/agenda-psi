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
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const horariosAtuacao = await prisma.horarioAtuacao.findMany({
      orderBy: [
        { diaDaSemana: 'asc' },
        { horaInicio: 'asc' },
      ],
    });
    return NextResponse.json(horariosAtuacao);
  } catch (error) {
    console.error('Erro ao buscar horários de atuação:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { diaDaSemana, horaInicio, horaFim, almocoInicio, almocoFim } = await request.json();

    if (diaDaSemana === undefined || !horaInicio || !horaFim) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const novoHorarioAtuacao = await prisma.horarioAtuacao.create({
      data: {
        diaDaSemana: parseInt(diaDaSemana),
        horaInicio,
        horaFim,
        almocoInicio,
        almocoFim,
      },
    });

    return NextResponse.json(novoHorarioAtuacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar horário de atuação:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
