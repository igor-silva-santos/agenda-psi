import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Buscar prontuário de um agendamento
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const prontuario = await prisma.prontuario.findFirst({
    where: { agendamentoId: params.id },
  });
  return NextResponse.json(prontuario);
}

// Salvar ou atualizar prontuário de um agendamento
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { texto } = await request.json();
  // Busca se já existe
  const existing = await prisma.prontuario.findFirst({ where: { agendamentoId: params.id } });
  let prontuario;
  if (existing) {
    prontuario = await prisma.prontuario.update({ where: { id: existing.id }, data: { texto } });
  } else {
    prontuario = await prisma.prontuario.create({ data: { agendamentoId: params.id, texto } });
  }
  return NextResponse.json(prontuario);
} 