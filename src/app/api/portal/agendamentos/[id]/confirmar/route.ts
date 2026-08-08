import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { sendEmail } from '@/lib/email';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { siteConfig } from '@/config/site';

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token.role !== 'PACIENTE' && token.role !== 'ADMIN')) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não tem permissão' }
    }, { status: 401 });
  }

  const { id } = params;

  try {
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('Agendamento')
      .select('*, user:User(*)') // Fetch related user data
      .eq('id', id)
      .single();

    if (agendamentoError || !agendamento || !agendamento.user) {
      return NextResponse.json({ error: 'Agendamento não encontrado ou não autorizado' }, { status: 404 });
    }

    if (token.role === 'PACIENTE' && agendamento.userId !== parseInt(token.id)) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: { reason: 'Usuário não pode confirmar agendamento de outra pessoa' }
      }, { status: 401 });
    }

    const { data: updatedAgendamento, error: updateError } = await supabase
      .from('Agendamento')
      .update({ status: 'CONFIRMADO' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao confirmar agendamento' }, { status: 500 });
    }

    /*
    // --- Envio de E-mails de Notificação de Confirmação ---
    const formattedDate = format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

    // E-mail para o Usuário
    await sendEmail({
      to: agendamento.user.email!,
      subject: 'Sua Consulta foi Confirmada - {siteConfig.professionalName}',
      html: `
        <p>Olá ${agendamento.user.name},</p>
        <p>Sua consulta para o dia <strong>${formattedDate}</strong> foi confirmada com sucesso.</p>
        <p>Atenciosamente,</p>
        <p>${siteConfig.professionalName}</p>
      `,
    });

    // E-mail para o Administrador
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'Agendamento Confirmado - Notificação Admin',
      html: `
        <p>Olá Administrador,</p>
        <p>O agendamento do usuário <strong>${agendamento.user.name} (${agendamento.user.email})</strong> para <strong>${formattedDate}</strong> foi confirmado pelo paciente.</p>
      `,
    });
    */

    return NextResponse.json(updatedAgendamento);

  } catch (error) {
    console.error(`Erro ao confirmar o agendamento ${id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
