import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import crypto from 'crypto';
import { createEvent } from 'ics';

const agendamentoSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  cpf: z.string(), // A validação do CPF será feita no backend
  motivoConsulta: z.string().min(10, "Motivo da consulta é obrigatório"),
  slotId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = agendamentoSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Dados inválidos', details: validation.error.format() }), { status: 400 });
    }

    const { nomeCompleto, email, telefone, cpf, motivoConsulta, slotId } = validation.data;

    // Tratamento de Conflito: Verifica se o slot ainda está disponível
    const slot = await prisma.bookableSlot.findFirst({
      where: {
        id: parseInt(slotId),
        isBooked: false,
      },
    });

    if (!slot) {
      return new NextResponse(JSON.stringify({ error: 'Este horário não está mais disponível. Por favor, selecione outro.' }), { status: 409 }); // 409 Conflict
    }

    // Lógica para criar ou encontrar o usuário
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      // Gerar token seguro para o novo usuário definir a senha
      const passwordResetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetExpires = new Date(Date.now() + 3600000); // Token válido por 1 hora

      user = await prisma.user.create({
        data: {
          name: nomeCompleto,
          email,
          cpf,
          role: 'PACIENTE',
          passwordResetToken,
          passwordResetExpires,
          // dataNascimento não está disponível aqui, pois não vem do frontend neste endpoint
        },
      });
    }

    // Cria o agendamento e atualiza o slot em uma transação
    const [agendamento, updatedSlot] = await prisma.$transaction([
      prisma.agendamento.create({
        data: {
          dataHora: slot.startDateTime,
          status: 'PRE_AGENDADO',
          userId: user.id,
          motivoConsulta: motivoConsulta,
        },
      }),
      prisma.bookableSlot.update({
        where: {
          id: parseInt(slotId),
        },
        data: {
          isBooked: true,
        },
      }),
    ]);

    // --- Envio de E-mails de Confirmação ---
    const formattedDate = format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

    // Gerar arquivo .ics
    let icsAttachment = undefined;
    try {
      const startDate = new Date(agendamento.dataHora);
      const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutos de duração
      // Garantir arrays de 5 elementos [ano, mês, dia, hora, minuto]
      const startArr = [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes()
      ];
      const endArr = [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes()
      ];
      // Forçar o tipo para [number, number, number, number, number]
      const startTuple: [number, number, number, number, number] = startArr as [number, number, number, number, number];
      const endTuple: [number, number, number, number, number] = endArr as [number, number, number, number, number];
      const event = {
        start: startTuple,
        end: endTuple,
        title: 'Consulta com Dra. Jandira Frederick',
        description: `Motivo da consulta: ${motivoConsulta || ''}`,
        location: 'Consulta Online ou Presencial',
        organizer: { name: 'Dra. Jandira Frederick', email: process.env.EMAIL_FROM || '' },
        attendees: [{ name: user.name || '', email: user.email || '' }],
      };
      const { error, value } = createEvent(event);
      if (!error && value) {
        icsAttachment = [{ filename: 'agendamento.ics', content: value, contentType: 'text/calendar' }];
      }
    } catch (icsError) {
      console.error('Erro ao gerar arquivo .ics:', icsError);
    }

    // E-mail para o Paciente
    let patientEmailHtml = `
      <p>Olá ${user.name},</p>
      <p>Seu pré-agendamento com a Dra. Jandira Frederick foi recebido com sucesso!</p>
      <p><strong>Detalhes do Agendamento:</strong></p>
      <ul>
        <li><strong>Data e Hora:</strong> ${formattedDate}</li>
        <li><strong>Status:</strong> ${agendamento.status}</li>
      </ul>
    `;

    if (isNewUser) {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${user.passwordResetToken}`;
      patientEmailHtml += `
        <p>Como é seu primeiro agendamento, por favor, defina sua senha para acessar o portal do paciente:</p>
        <p><a href="${resetUrl}">Definir Minha Senha</a></p>
        <p>Este link é válido por 1 hora.</p>
      `;
    }

    patientEmailHtml += `
      <p>Aguarde a confirmação final da Dra. Jandira Frederick.</p>
      <p>Atenciosamente,</p>
      <p>Dra. Jandira Frederick</p>
    `;

    await sendEmail({
      to: user.email!,
      subject: isNewUser ? 'Bem-vindo(a) e Confirmação de Pré-Agendamento' : 'Confirmação de Pré-Agendamento - Dra. Jandira Frederick',
      html: patientEmailHtml,
      attachments: icsAttachment,
    });

    // E-mail para o Administrador
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'Novo Pré-Agendamento Recebido',
      html: `
        <p>Olá Administrador,</p>
        <p>Um novo pré-agendamento foi realizado:</p>
        <ul>
          <li><strong>Paciente:</strong> ${user.name} (${user.email})</li>
          <li><strong>Data e Hora:</strong> ${formattedDate}</li>
          <li><strong>Status:</strong> ${agendamento.status}</li>
          <li><strong>Motivo da Consulta:</strong> ${motivoConsulta}</li>
        </ul>
        <p>Acesse o painel administrativo para mais detalhes e para confirmar o agendamento.</p>
      `,
    });
    // --- Fim do Envio de E-mails ---

    return NextResponse.json({ message: 'Seu pré-agendamento foi realizado com sucesso! Um e-mail de confirmação foi enviado.', agendamento }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return new NextResponse(JSON.stringify({ error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' }), { status: 500 });
  }
}
