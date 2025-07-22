import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request, { params }: { params: { date: string } }) {
  console.log('[DISPONIBILIDADE-DIARIA][GET][date] Início da requisição', { params });
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET][date] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET][date] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET][date] Sessão inválida ou usuário não é admin', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const date = params.date;
    if (!date) {
      return new NextResponse('Missing date parameter', { status: 400 });
    }
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    console.log('[DISPONIBILIDADE-DIARIA][GET][date] Buscando disponibilidade para data:', targetDate);
    const existingEntry = await prisma.disponibilidadeDiaria.findUnique({
      where: { data: targetDate },
    });
    if (!existingEntry) {
      return new NextResponse('No availability entry found for this date', { status: 404 });
    }
    return new NextResponse(JSON.stringify(existingEntry), { status: 200 });
  } catch (error) {
    console.error('[DISPONIBILIDADE-DIARIA][GET][date] ERRO:', error);
    return new NextResponse('Erro interno ao buscar disponibilidade diária', { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { date: string } }) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const date = params.date;
    if (!date) {
      return new NextResponse('Missing date parameter', { status: 400 });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const existingEntry = await prisma.disponibilidadeDiaria.findUnique({
      where: { data: targetDate },
    });

    if (existingEntry) {
      return new NextResponse('Availability entry already exists for this date', { status: 409 });
    }

    // Receber os campos obrigatórios do body
    const { horaInicio, horaFim, almocoInicio, almocoFim } = await request.json();
    if (!horaInicio || !horaFim) {
      return new NextResponse('horaInicio e horaFim são obrigatórios', { status: 400 });
    }

    const newEntry = await prisma.disponibilidadeDiaria.create({
      data: {
        data: targetDate,
        horaInicio,
        horaFim,
        almocoInicio,
        almocoFim,
      },
    });

    return new NextResponse(JSON.stringify(newEntry), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar disponibilidade diária:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { date: string } }
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
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const date = params.date;
    if (!date) {
      return new NextResponse('Missing date parameter', { status: 400 });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const existingEntry = await prisma.disponibilidadeDiaria.findUnique({
      where: { data: targetDate },
    });

    if (!existingEntry) {
      return new NextResponse('No availability entry found for this date', { status: 404 });
    }

    await prisma.disponibilidadeDiaria.delete({
      where: { id: existingEntry.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao deletar disponibilidade diária:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
