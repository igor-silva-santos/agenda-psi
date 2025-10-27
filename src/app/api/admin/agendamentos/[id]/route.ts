import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/googleCalendar';
import { addMinutes } from 'date-fns';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

const APPOINTMENT_DURATION_MINUTES = 30;
const ALLOWED_STATUSES = ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'REALIZADO'];

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
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ 
        error: 'Missing status field',
        details: { missingField: 'status' }
      }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Status "${status}" inválido.`,
        details: { allowedStatuses: ALLOWED_STATUSES, providedStatus: status }
      }, { status: 400 });
    }

    const { data: updatedAgendamento, error: updateError } = await supabase
      .from('Agendamento')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedAgendamento) {
      return NextResponse.json({ 
        error: 'Erro ao atualizar agendamento',
        details: { agendamentoId: id, message: updateError?.message }
      }, { status: 500 });
    }

    if (updatedAgendamento.googleCalendarEventId) {
      if (status === 'CANCELADO') {
        try {
          await deleteCalendarEvent(updatedAgendamento.googleCalendarEventId);
        } catch (calendarError) {
          console.error('Failed to delete Google Calendar event on status change:', calendarError);
        }
      } else {
        const { data: paciente, error: pacienteError } = await supabase
          .from('User')
          .select('*')
          .eq('id', updatedAgendamento.userId)
          .single();

        if (paciente && paciente.email) {
          const appointmentDateTime = new Date(updatedAgendamento.dataHora);
          const endDateTime = addMinutes(appointmentDateTime, APPOINTMENT_DURATION_MINUTES);

          try {
            await updateCalendarEvent(updatedAgendamento.googleCalendarEventId, {
              summary: `Consulta com ${paciente.name}`,
              description: `Paciente: ${paciente.name}
Email: ${paciente.email}
Status: ${status}`,
              start: {
                dateTime: appointmentDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
              },
              end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
              },
              attendees: [{ email: paciente.email }],
            });
          } catch (calendarError) {
            console.error('Failed to update Google Calendar event on status change:', calendarError);
          }
        }
      }
    }

    return NextResponse.json(updatedAgendamento);
  } catch (error) {
    console.error('Error in /api/admin/agendamentos/[id] PUT:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
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
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  try {
    const { id } = params;
    
    // Buscar agendamento antes de deletar para verificar googleCalendarEventId
    const { data: agendamento, error: findError } = await supabase
      .from('Agendamento')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !agendamento) {
      return NextResponse.json({ 
        error: 'Agendamento não encontrado',
        details: { agendamentoId: id }
      }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('Agendamento')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Erro ao deletar agendamento',
        details: { agendamentoId: id, message: deleteError.message }
      }, { status: 500 });
    }

    if (agendamento.googleCalendarEventId) {
      try {
        await deleteCalendarEvent(agendamento.googleCalendarEventId);
      } catch (calendarError) {
        console.error('Failed to delete Google Calendar event:', calendarError);
      }
    }

    return NextResponse.json({ message: 'Agendamento deletado com sucesso' }, { status: 204 });
  } catch (error) {
    console.error('Error in /api/admin/agendamentos/[id] DELETE:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}