import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/googleCalendar';
import { addMinutes } from 'date-fns';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const APPOINTMENT_DURATION_MINUTES = 30;
const ALLOWED_STATUSES = ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'PRE_AGENDADO', 'REALIZADO'];

export async function PUT(request: Request, { params }: { params: { id: number } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new NextResponse('Missing status field', { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return new NextResponse(`Status "${status}" inválido.`, { status: 400 });
    }

    const updatedAgendamento = await prisma.agendamento.update({
      where: { id: String(id) },
      data: { status },
    });

    if (updatedAgendamento.googleCalendarEventId) {
      if (status === 'CANCELADO') {
        try {
          await deleteCalendarEvent(updatedAgendamento.googleCalendarEventId);
        } catch (calendarError) {
          console.error('Failed to delete Google Calendar event on status change:', calendarError);
        }
      } else {
        const paciente = await prisma.user.findUnique({
          where: { id: updatedAgendamento.userId },
        });

        if (paciente && paciente.email) {
          const appointmentDateTime = updatedAgendamento.dataHora;
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = params;
    const agendamento = await prisma.agendamento.delete({
      where: { id: String(id) },
    });

    if (agendamento.googleCalendarEventId) {
      try {
        await deleteCalendarEvent(agendamento.googleCalendarEventId);
      } catch (calendarError) {
        console.error('Failed to delete Google Calendar event:', calendarError);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in /api/admin/agendamentos/[id] DELETE:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}