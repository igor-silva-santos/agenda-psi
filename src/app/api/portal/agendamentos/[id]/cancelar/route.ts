import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getToken } from 'next-auth/jwt';

export async function PUT(
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

  if (!session || !session.user || session.user.role !== 'PACIENTE') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = params;

  try {
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id: String(id),
        userId: session.user.id, // Garante que o paciente só pode modificar seus próprios agendamentos
      },
      include: { user: true }, // Inclui dados do usuário para o e-mail
    });

    if (!agendamento) {
      return new NextResponse('Agendamento não encontrado ou não autorizado', { status: 404 });
    }

    // Regra de negócio: Não permitir cancelamento com menos de 24h de antecedência (exemplo)
    const agora = new Date();
    const dataConsulta = new Date(agendamento.dataHora);
    const diffHoras = (dataConsulta.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (diffHoras < 24) {
      return new NextResponse('Não é possível cancelar com menos de 24 horas de antecedência.', { status: 403 });
    }

    const updatedAgendamento = await prisma.agendamento.update({
      where: { id: String(id) },
      data: { status: 'CANCELADO' },
    });

    // --- Envio de E-mails de Notificação de Cancelamento ---
    const formattedDate = format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

    // E-mail para o Usuário
    await sendEmail({
      to: agendamento.user.email!,
      subject: 'Agendamento Cancelado - Dra. Jandira Frederick',
      html: `
        <p>Olá ${agendamento.user.name},</p>
        <p>Seu agendamento para <strong>${formattedDate}</strong> foi cancelado com sucesso.</p>
        <p>Se desejar, você pode agendar uma nova consulta através do nosso site.</p>
        <p>Atenciosamente,</p>
        <p>Dra. Jandira Frederick</p>
      `,
    });

    // E-mail para o Administrador
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'Agendamento Cancelado - Notificação Admin',
      html: `
        <p>Olá Administrador,</p>
        <p>O agendamento do usuário <strong>${agendamento.user.name} (${agendamento.user.email})</strong> para <strong>${formattedDate}</strong> foi cancelado.</p>
      `,
    });
    // --- Fim do Envio de E-mails ---

    return NextResponse.json(updatedAgendamento);
  } catch (error) {
    console.error(`Erro ao cancelar o agendamento ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
