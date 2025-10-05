import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { format, addMinutes } from "date-fns";
import { createCalendarEvent, isGoogleCalendarConfigured } from "@/lib/googleCalendar";
import { getToken } from 'next-auth/jwt';

const APPOINTMENT_DURATION_MINUTES = 30;

export async function PUT(request: Request, { params }: { params: { id: number } }) {
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
  if (!session || !session.user) {
    return NextResponse.json({
      error: 'Unauthorized',
      details: { reason: 'Sessão inválida' }
    }, { status: 401 });
  }

  const { status } = await request.json();

  const { data: agendamento, error: agendamentoError } = await supabase
    .from('Agendamento')
    .select('*, user:User(*)')
    .eq('id', params.id)
    .single();

  if (agendamentoError || !agendamento || agendamento.userId !== session.user.id) {
    return NextResponse.json({
      error: "Forbidden",
      details: { reason: 'Agendamento não pertence ao usuário', agendamentoId: params.id }
    }, { status: 403 });
  }

  const { data: updatedAgendamento, error: updateError } = await supabase
    .from('Agendamento')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single();
  if (updateError || !updatedAgendamento) {
    return NextResponse.json({
      error: 'Erro ao atualizar status do agendamento',
      details: { agendamentoId: params.id, message: updateError?.message }
    }, { status: 500 });
  }

  if (updatedAgendamento.status === 'CONFIRMADO') {
    const appointmentDateTime = new Date(updatedAgendamento.dataHora);
    const endDateTime = addMinutes(appointmentDateTime, APPOINTMENT_DURATION_MINUTES);
    let googleCalendarEventId: string | null = null;

    // Verificar se a API do Google Calendar está configurada
    if (isGoogleCalendarConfigured()) {
      try {
        const event = {
          summary: `Consulta com ${agendamento.user.name}`,
          description: `Usuário: ${agendamento.user.name}\nEmail: ${agendamento.user.email}`,
          start: {
            dateTime: appointmentDateTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          attendees: [{ email: agendamento.user.email! }],
        };
        
        const calendarEvent = await createCalendarEvent(event);
        googleCalendarEventId = calendarEvent?.id || null;
        
        if (calendarEvent) {
          console.log('✅ Evento criado no Google Calendar:', calendarEvent.id);
        } else {
          console.warn('⚠️ Falha ao criar evento no Google Calendar');
        }
      } catch (calendarError: any) {
        console.error('❌ Erro ao criar evento no Google Calendar:', {
          error: calendarError.message,
          code: calendarError.code,
          agendamentoId: params.id
        });
      }
    } else {
      console.warn('⚠️ Google Calendar API não configurada. Evento não criado.');
    }

    // Atualizar o agendamento com o ID do evento do Google Calendar (se criado)
    if (googleCalendarEventId) {
      try {
        await supabase
          .from('Agendamento')
          .update({ googleCalendarEventId })
          .eq('id', updatedAgendamento.id);
        console.log('✅ ID do evento do Google Calendar salvo no agendamento');
      } catch (error) {
        console.error('❌ Erro ao salvar ID do evento do Google Calendar:', error);
      }
    }

    // Enviar email de confirmação
    try {
      const formattedDate = format(appointmentDateTime, 'dd/MM/yyyy HH:mm');
      await sendEmail({
        to: agendamento.user.email!,
        subject: 'Confirmação de Agendamento - Jandira C. Frederick',
        html: `
          <p>Olá ${agendamento.user.name},</p>
          <p>Seu agendamento com a Jandira C. Frederick foi confirmado para o dia <strong>${formattedDate}</strong>.</p>
          <p>Aguardamos você!</p>
          <p>Atenciosamente,</p>
          <p>Jandira C. Frederick</p>
        `,
      });
      console.log('✅ Email de confirmação enviado');
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de confirmação:', emailError);
    }
  }

  return NextResponse.json({
    message: "Status atualizado com sucesso",
    details: {
      agendamentoId: params.id,
      newStatus: status,
      googleCalendarEventId: null // Sempre null fora do bloco CONFIRMADO
    }
  }, { status: 200 });
}
