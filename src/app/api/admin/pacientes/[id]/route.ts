import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  console.log('[PACIENTES][GET][id] Início da requisição', { params });
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PACIENTES][GET][id] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    console.warn('[PACIENTES][GET][id] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    console.warn('[PACIENTES][GET][id] Sessão inválida ou usuário não é admin', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { id } = params;
  try {
    const paciente = await prisma.user.findUnique({
      where: { id: Number(id), role: 'PACIENTE' },
      include: { agendamentos: true },
    });
    if (!paciente) {
      return new NextResponse('Paciente não encontrado', { status: 404 });
    }
    return NextResponse.json(paciente);
  } catch (error) {
    console.error('[PACIENTES][GET][id] ERRO:', error);
    return new NextResponse('Erro interno ao buscar paciente', { status: 500 });
  }
}
