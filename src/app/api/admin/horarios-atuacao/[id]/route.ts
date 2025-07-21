import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function PUT(request: Request, { params }: { params: { id: number } }) {
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
    const { id } = params;
    const { diaDaSemana, horaInicio, horaFim } = await request.json();

    if (!id || diaDaSemana === undefined || !horaInicio || !horaFim) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const updatedHorarioAtuacao = await prisma.horarioAtuacao.update({
      where: { id: Number(id) },
      data: {
        diaDaSemana: parseInt(diaDaSemana),
        horaInicio,
        horaFim,
      },
    });

    return NextResponse.json(updatedHorarioAtuacao);
  } catch (error) {
    console.error('Erro ao atualizar horário de atuação:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
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
    const { id } = params;

    if (!id) {
      return new NextResponse('Missing ID parameter', { status: 400 });
    }

    await prisma.horarioAtuacao.delete({
      where: { id: Number(id) },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Erro ao deletar horário de atuação:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
