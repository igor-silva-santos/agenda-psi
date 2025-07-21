import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { format, addMinutes } from 'date-fns';
import { createCalendarEvent } from '@/lib/googleCalendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const APPOINTMENT_DURATION_MINUTES = 30;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId, dataHora, status, nome, email, cpf, telefone, bookableSlotId } = body;
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return new NextResponse('User not found', { status: 404 });
      }
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Gerar senha aleatória e data de nascimento padrão
        const senhaAleatoria = crypto.randomBytes(8).toString('hex');
        const dataNascimentoPadrao = new Date('2000-01-01');
        user = await prisma.user.create({
          data: {
            name: nome,
            email,
            cpf,
            telefone,
            role: 'PACIENTE',
            dataNascimento: dataNascimentoPadrao,
            password: await bcrypt.hash(senhaAleatoria, 10),
          },
        });
      }
    } else {
      return new NextResponse('Missing userId or email for appointment', { status: 400 });
    }

    const appointmentDateTime = new Date(dataHora);

    const agendamento = await prisma.agendamento.create({
      data: {
        userId: user.id,
        dataHora: appointmentDateTime,
        status: status || 'PENDENTE',
        motivoConsulta: body.motivoConsulta || '',
      },
    });

    if (bookableSlotId) {
      await prisma.bookableSlot.update({
        where: { id: bookableSlotId },
        data: { isBooked: true },
      });
    }

    if (agendamento.status === 'PENDENTE') {
      const endDateTime = addMinutes(appointmentDateTime, APPOINTMENT_DURATION_MINUTES);
      let googleCalendarEventId = null;
      try {
        const event = {
          summary: `Consulta com ${user.name}`,
          description: `Paciente: ${user.name}
Email: ${user.email}`,
          start: {
            dateTime: appointmentDateTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          attendees: user.email ? [{ email: user.email }] : [],
        };
        const calendarEvent = await createCalendarEvent(event);
        googleCalendarEventId = calendarEvent?.id || null;
        await prisma.agendamento.update({
          where: { id: agendamento.id },
          data: { googleCalendarEventId: googleCalendarEventId },
        });
      } catch (calendarError) {
        console.error('Failed to create Google Calendar event:', calendarError);
      }

      const formattedDate = format(appointmentDateTime, 'dd/MM/yyyy HH:mm');
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: 'Confirmação de Agendamento - Dra. Jandira Frederick',
          html: `
            <p>Olá ${user.name},</p>
            <p>Seu agendamento com a Dra. Jandira Frederick foi confirmado para o dia <strong>${formattedDate}</strong>.</p>
            <p>Aguardamos você!</p>
            <p>Atenciosamente,</p>
            <p>Dra. Jandira Frederick</p>
          `,
        });
      }
    }

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error('Error in /api/agendamento POST:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}