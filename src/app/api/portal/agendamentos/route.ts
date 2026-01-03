import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createEvent } from 'ics';

export async function GET(request: Request) {
  try {
    console.log('[PORTAL-AGENDAMENTOS][GET] Início da requisição');
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.id || (token.role !== 'PACIENTE' && token.role !== 'ADMIN')) {
      console.warn('[PORTAL-AGENDAMENTOS][GET] Token ausente, ID ausente ou usuário sem permissão');
      return NextResponse.json({
        error: 'Unauthorized',
        details: { reason: 'Token inválido ou usuário sem permissão' }
      }, { status: 401 });
    }

    // DEBUG: Log das variáveis de ambiente
    console.log('[DEBUG] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[DEBUG] SERVICE_ROLE_KEY is set:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);


    // Criar um cliente Supabase com a chave de serviço para esta requisição específica
    // Isso bypassa a RLS, então a filtragem manual pelo userId é CRÍTICA para a segurança.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: agendamentos, error: agendamentoError } = await supabaseAdmin
      .from('Agendamento')
      .select('*')
      .eq('patientId', token.id) // APLICAÇÃO MANUAL DA SEGURANÇA
      .order('dataHora', { ascending: true });

    if (agendamentoError) {
      throw agendamentoError;
    }

    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error('[PORTAL-AGENDAMENTOS][GET] ERRO:', error);
    return NextResponse.json({
      error: 'Erro interno ao buscar agendamentos do paciente',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}const portalAgendamentoSchema = z.object({
  slotId: z.union([z.string(), z.number()]).transform(val => String(val)),
  motivoConsulta: z.string().optional(),
});

export async function POST(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id || (token.role !== 'PACIENTE' && token.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = portalAgendamentoSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Dados inválidos', details: validation.error.format() }), { status: 400 });
    }

    const { slotId, motivoConsulta } = validation.data;
    const slotDateTime = new Date(parseInt(slotId));

    // Criar um cliente Supabase com a chave de serviço para esta requisição
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: agendamento, error: agendamentoError } = await supabaseAdmin
      .from('Agendamento')
      .insert([
        {
          dataHora: slotDateTime.toISOString(),
          status: 'PENDENTE',
          patientId: token.id, // Segurança: Garante que o agendamento seja para o usuário do token
          motivoConsulta: motivoConsulta || 'Agendamento via portal do paciente',
        }
      ])
      .select()
      .single();
      
    if (agendamentoError) {
      throw agendamentoError;
    }

    // --- Envio de E-mails de Confirmação ---
    const user = token;
    const formattedDate = format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

    let icsAttachment = undefined;
    try {
      const startDate = new Date(agendamento.dataHora);
      const endDate = new Date(startDate.getTime() + 30 * 60000);
      const event = {
        start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()] as [number, number, number, number, number],
        end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()] as [number, number, number, number, number],
        title: 'Consulta com Jandira C. Frederick',
        description: `Motivo da consulta: ${motivoConsulta || ''}`,
        location: 'Consulta Online ou Presencial',
        organizer: { name: 'Jandira C. Frederick', email: process.env.EMAIL_FROM || '' },
        attendees: [{ name: user.name || '', email: user.email || '' }],
      };
      const { error, value } = createEvent(event);
      if (!error && value) {
        icsAttachment = [{ filename: 'agendamento.ics', content: value, contentType: 'text/calendar' }];
      }
    } catch (icsError) {
      console.error('Erro ao gerar arquivo .ics:', icsError);
    }

    const patientEmailHtml = `
      <p>Olá ${user.name},</p>
      <p>Seu pré-agendamento com a Jandira C. Frederick foi recebido com sucesso!</p>
      <p><strong>Detalhes do Agendamento:</strong></p>
      <ul>
        <li><strong>Data e Hora:</strong> ${formattedDate}</li>
        <li><strong>Status:</strong> ${agendamento.status}</li>
      </ul>
      <p>Aguarde a confirmação final da Jandira C. Frederick.</p>
      <p>Atenciosamente,</p>
      <p>Jandira C. Frederick</p>
    `;

    try {
      await sendEmail({
        to: user.email!,
        subject: 'Confirmação de Pré-Agendamento - Jandira C. Frederick',
        html: patientEmailHtml,
        attachments: icsAttachment,
      });
    } catch (emailError) {
      console.error('[PORTAL-AGENDAMENTOS][POST] Erro ao enviar email para o paciente:', emailError);
    }

    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: 'Novo Pré-Agendamento Recebido (Portal)',
        html: `
          <p>Um novo pré-agendamento foi realizado através do portal do paciente:</p>
          <ul>
            <li><strong>Paciente:</strong> ${user.name} (${user.email})</li>
            <li><strong>Data e Hora:</strong> ${formattedDate}</li>
          </ul>
        `,
      });
    } catch (emailError) {
      console.error('[PORTAL-AGENDAMENTOS][POST] Erro ao enviar email para o administrador:', emailError);
    }

    return NextResponse.json(agendamento, { status: 201 });

  } catch (error) {
    console.error('[PORTAL-AGENDAMENTOS][POST] Erro ao criar agendamento:', error);
    return new NextResponse(JSON.stringify({ error: 'Ocorreu um erro no servidor.', details: error }), { status: 500 });
  }
}
