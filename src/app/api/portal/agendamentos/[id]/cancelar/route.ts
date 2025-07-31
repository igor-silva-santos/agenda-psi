import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Token ausente' }
    }, { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user.role !== 'PACIENTE' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não tem permissão', userRole: session?.user?.role }
    }, { status: 401 });
  }

  const { id } = params;

  try {
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('Agendamento')
      .select('*, user:User(*)')
      .eq('id', id)
      .eq('userId', session.user.id)
      .single();
    if (agendamentoError || !agendamento) {
      return NextResponse.json({ 
        error: 'Agendamento não encontrado ou não autorizado',
        details: { agendamentoId: id, userId: session.user.id }
      }, { status: 404 });
    }

    // Regra de negócio: Não permitir cancelamento com menos de 24h de antecedência
    const agora = new Date();
    const dataConsulta = new Date(agendamento.dataHora);
    const diffHoras = (dataConsulta.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (diffHoras < 24) {
      return NextResponse.json({ 
        error: 'Não é possível cancelar com menos de 24 horas de antecedência.',
        details: { diffHoras: Math.round(diffHoras), dataConsulta: agendamento.dataHora }
      }, { status: 403 });
    }

    const { data: updatedAgendamento, error: updateError } = await supabase
      .from('Agendamento')
      .update({ status: 'CANCELADO' })
      .eq('id', id)
      .select()
      .single();
    if (updateError || !updatedAgendamento) {
      return NextResponse.json({ 
        error: 'Erro ao cancelar agendamento',
        details: { agendamentoId: id, message: updateError?.message }
      }, { status: 500 });
    }

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
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
