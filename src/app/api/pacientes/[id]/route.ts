import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({ where: { cpf: params.id } });
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado.',
        details: { cpf: params.id }
      }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao buscar usuário.',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
} 