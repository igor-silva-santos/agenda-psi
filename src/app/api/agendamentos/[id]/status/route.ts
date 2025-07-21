import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { format, addMinutes } from "date-fns";
import { createCalendarEvent } from "@/lib/googleCalendar";
import { getToken } from 'next-auth/jwt';

const APPOINTMENT_DURATION_MINUTES = 30;

export async function PUT(request: Request, { params }: { params: { id: number } }) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { status } = await request.json();

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: String(params.id) },
    include: { user: true },
  });

  if (!agendamento || agendamento.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const updatedAgendamento = await prisma.agendamento.update({
    where: {
      id: String(params.id),
    },
    data: {
      status,
    },
  });

  if (updatedAgendamento.status === 'CONFIRMADO') {
    const appointmentDateTime = new Date(updatedAgendamento.dataHora);
    const endDateTime = addMinutes(appointmentDateTime, APPOINTMENT_DURATION_MINUTES);
    let googleCalendarEventId = null;
    try {
      const event = {
        summary: `Consulta com ${agendamento.user.name}`,
        description: `Usuário: ${agendamento.user.name}
Email: ${agendamento.user.email}`,
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
      await prisma.agendamento.update({
        where: { id: updatedAgendamento.id },
        data: { googleCalendarEventId },
      });
    } catch (calendarError) {
      console.error('Failed to create Google Calendar event:', calendarError);
    }

    const formattedDate = format(appointmentDateTime, 'dd/MM/yyyy HH:mm');
    await sendEmail({
      to: agendamento.user.email!,
      subject: 'Confirmação de Agendamento - Dra. Jandira Frederick',
      html: `
        <p>Olá ${agendamento.user.name},</p>
        <p>Seu agendamento com a Dra. Jandira Frederick foi confirmado para o dia <strong>${formattedDate}</strong>.</p>
        <p>Aguardamos você!</p>
        <p>Atenciosamente,</p>
        <p>Dra. Jandira Frederick</p>
      `,
    });
  }

  return new NextResponse("OK", { status: 200 });
}