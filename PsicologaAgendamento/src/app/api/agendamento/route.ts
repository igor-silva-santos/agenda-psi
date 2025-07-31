import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
      const { data: foundUser, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();
      if (userError || !foundUser) {
        return NextResponse.json({ 
          error: 'User not found',
          details: { userId }
        }, { status: 404 });
      }
      user = foundUser;
    } else if (email) {
      const { data: foundUser, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .single();
      if (userError || !foundUser) {
        // Gerar senha aleatória e data de nascimento padrão
        const senhaAleatoria = crypto.randomBytes(8).toString('hex');
        const dataNascimentoPadrao = new Date('2000-01-01');
        const { data: createdUser, error: createUserError } = await supabase
          .from('User')
          .insert([
            {
              name: nome,
              email,
              cpf,
              telefone,
              role: 'PACIENTE',
              dataNascimento: dataNascimentoPadrao,
              password: await bcrypt.hash(senhaAleatoria, 10),
            },
          ])
          .select()
          .single();
        if (createUserError || !createdUser) {
          return NextResponse.json({ 
            error: 'Erro ao criar usuário',
            details: { email, message: createUserError?.message }
          }, { status: 500 });
        }
        user = createdUser;
      } else {
        user = foundUser;
      }
    } else {
      return NextResponse.json({ 
        error: 'Missing userId or email for appointment',
        details: { missingFields: ['userId', 'email'] }
      }, { status: 400 });
    }

    const appointmentDateTime = new Date(dataHora);

    const { data: agendamento, error: agendamentoError } = await supabase
      .from('Agendamento')
      .insert([
        {
          userId: user.id,
          dataHora: appointmentDateTime,
          status: status || 'PENDENTE',
          motivoConsulta: body.motivoConsulta || '',
        },
      ])
      .select()
      .single();
    if (agendamentoError || !agendamento) {
      return NextResponse.json({ 
        error: 'Erro ao criar agendamento',
        details: { userId: user.id, message: agendamentoError?.message }
      }, { status: 500 });
    }

    if (bookableSlotId) {
      const { error: slotError } = await supabase
        .from('BookableSlot')
        .update({ isBooked: true })
        .eq('id', bookableSlotId);
      if (slotError) {
        return NextResponse.json({ 
          error: 'Erro ao atualizar slot',
          details: { bookableSlotId, message: slotError.message }
        }, { status: 500 });
      }
    }

    if (agendamento.status === 'PENDENTE') {
      const endDateTime = addMinutes(appointmentDateTime, APPOINTMENT_DURATION_MINUTES);
      let googleCalendarEventId = null;
      try {
        const event = {
          summary: `Consulta com ${user.name}`,
          description: `Paciente: ${user.name}\nEmail: ${user.email}`,
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
        await supabase
          .from('Agendamento')
          .update({ googleCalendarEventId })
          .eq('id', agendamento.id);
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
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}