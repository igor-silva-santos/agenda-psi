import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(
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

  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: id, role: 'PACIENTE' },
      include: { agendamentos: true }, // Inclui agendamentos para exibir no histórico
    });

    if (!user) {
      return new NextResponse('Usuário não encontrado', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
