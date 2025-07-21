import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Buscar recomendação de um agendamento
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const recomendacao = await prisma.recomendacao.findFirst({
    where: { agendamentoId: params.id },
  });
  return NextResponse.json(recomendacao);
}

// Salvar ou atualizar recomendação de um agendamento
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { texto } = await request.json();
  // Busca se já existe
  const existing = await prisma.recomendacao.findFirst({ where: { agendamentoId: params.id } });
  let recomendacao;
  if (existing) {
    recomendacao = await prisma.recomendacao.update({ where: { id: existing.id }, data: { texto } });
  } else {
    recomendacao = await prisma.recomendacao.create({ data: { agendamentoId: params.id, texto } });
  }
  return NextResponse.json(recomendacao);
}