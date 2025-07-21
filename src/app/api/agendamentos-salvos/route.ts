import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        user: true, // Inclui os dados do usuário associado
      },
      orderBy: {
        dataHora: 'asc', // Ordena por data e hora
      },
    });
    return NextResponse.json(agendamentos);
  } catch (error) {
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
