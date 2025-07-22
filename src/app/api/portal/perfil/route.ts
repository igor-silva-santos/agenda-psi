import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';

const perfilSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  cpf: z.string().optional(), // Adicione validação de CPF se necessário
  image: z.string().url('URL da imagem inválida').optional(),
});

export async function GET(request: Request) {
  console.log('[PORTAL-PERFIL][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PORTAL-PERFIL][GET] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    console.warn('[PORTAL-PERFIL][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  try {
    return NextResponse.json(user);
  } catch (error) {
    console.error('[PORTAL-PERFIL][GET] ERRO:', error);
    return new NextResponse('Erro interno ao buscar perfil', { status: 500 });
  }
}

export async function PUT(request: Request) {
  console.log('[PORTAL-PERFIL][PUT] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PORTAL-PERFIL][PUT] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    console.warn('[PORTAL-PERFIL][PUT] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  try {
    const data = await request.json();
    const updated = await prisma.user.update({
      where: { id: Number(token.id) },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PORTAL-PERFIL][PUT] ERRO:', error);
    return new NextResponse('Erro interno ao atualizar perfil', { status: 500 });
  }
}