import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
  cpf: z.string(),
  motivoConsulta: z.string().optional(),
  slotId: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[AGENDAMENTOS][POST] Dados recebidos:', body);
    
    const validation = agendamentoSchema.safeParse(body);

    if (!validation.success) {
      console.error('[AGENDAMENTOS][POST] Erro de validação:', validation.error.format());
      return new NextResponse(JSON.stringify({ error: 'Dados inválidos', details: validation.error.format() }), { status: 400 });
    }

    const { nomeCompleto, email, telefone, cpf, motivoConsulta, slotId } = validation.data;

    console.log('[AGENDAMENTOS][POST] Verificando slot:', slotId);

    // Como os slots são gerados dinamicamente, vamos converter o slotId (timestamp) para Date
    const slotDateTime = new Date(parseInt(slotId));
    console.log('[AGENDAMENTOS][POST] Data/Hora do slot:', slotDateTime.toISOString());

    const slotEndDateTime = new Date(slotDateTime.getTime() + 1000); // 1 second window for safety

    // Verifica se já existe um agendamento para este horário
    const { data: existingAgendamento, error: agendamentoCheckError } = await supabase
      .from('Agendamento')
      .select('id')
      .gte('dataHora', slotDateTime.toISOString())
      .lt('dataHora', slotEndDateTime.toISOString())
      .neq('status', 'CANCELADO')
      .maybeSingle();

    if (existingAgendamento) {
      console.error('[AGENDAMENTOS][POST] Slot já possui agendamento:', existingAgendamento);
      return new NextResponse(JSON.stringify({ error: 'Este horário não está mais disponível. Por favor, selecione outro.' }), { status: 409 });
    }

    console.log('[AGENDAMENTOS][POST] Slot disponível para agendamento');

    console.log('[AGENDAMENTOS][POST] Verificando se usuário existe para email:', email);

    // Busca ou cria usuário
    let { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    let isNewUser = false;
    if (userError || !user) {
      console.log('[AGENDAMENTOS][POST] Criando novo usuário para:', email);
      isNewUser = true;
      const passwordResetToken = crypto.randomBytes(32).toString('hex');
      const senhaAleatoria = crypto.randomBytes(8).toString('hex');
      
      console.log('[AGENDAMENTOS][POST] Dados do novo usuário:', {
        name: nomeCompleto,
        email,
        cpf,
        role: 'PACIENTE',
        passwordResetToken,
        dataNascimento: new Date('2000-01-01'),
        telefone: telefone || '',
        password: senhaAleatoria,
      });
      
      const { data: createdUser, error: createUserError } = await supabase
        .from('User')
        .insert([
          {
            name: nomeCompleto,
            email,
            cpf,
            role: 'PACIENTE',
            passwordResetToken,
            dataNascimento: new Date('2000-01-01'),
            telefone: telefone || '',
            password: senhaAleatoria,
          }
        ])
        .select()
        .single();
        
      if (createUserError || !createdUser) {
        console.error('[AGENDAMENTOS][POST] Erro ao criar usuário:', createUserError);
        return new NextResponse(JSON.stringify({ error: 'Erro ao criar usuário.', details: createUserError }), { status: 500 });
      }
      user = createdUser;
      console.log('[AGENDAMENTOS][POST] Usuário criado:', user.id);
    } else {
      console.log('[AGENDAMENTOS][POST] Usuário existente encontrado:', user.id);
    }

    console.log('[AGENDAMENTOS][POST] Criando agendamento para usuário:', user.id);
    console.log('[AGENDAMENTOS][POST] Dados do agendamento:', {
      dataHora: slotDateTime.toISOString(),
                status: 'PENDENTE',      userId: user.id,
      motivoConsulta: motivoConsulta || 'Consulta agendada via sistema',
    });

    // Cria o agendamento
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('Agendamento')
      .insert([
        {
          dataHora: slotDateTime.toISOString(),
          status: 'PENDENTE',
          userId: user.id,
          motivoConsulta: motivoConsulta || 'Consulta agendada via sistema',
        }
      ])
      .select()
      .single();
      
    if (agendamentoError || !agendamento) {
      console.error('[AGENDAMENTOS][POST] Erro ao criar agendamento:', agendamentoError);
      return new NextResponse(JSON.stringify({ error: 'Erro ao criar agendamento.', details: agendamentoError }), { status: 500 });
    }

    console.log('[AGENDAMENTOS][POST] Agendamento criado:', agendamento.id);

    // --- Envio de E-mails de Confirmação ---
    const formattedDate = format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

    // Gerar arquivo .ics
    let icsAttachment = undefined;
    try {
      const startDate = new Date(agendamento.dataHora);
      const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutos de duração
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
      const startTuple: [number, number, number, number, number] = startArr as [number, number, number, number, number];
      const endTuple: [number, number, number, number, number] = endArr as [number, number, number, number, number];
      const event = {
        start: startTuple,
        end: endTuple,
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

    // E-mail para o Paciente
    let patientEmailHtml = `
      <p>Olá ${user.name},</p>
      <p>Seu pré-agendamento com a Jandira C. Frederick foi recebido com sucesso!</p>
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
      <p>Aguarde a confirmação final da Jandira C. Frederick.</p>
      <p>Atenciosamente,</p>
      <p>Jandira C. Frederick</p>
    `;

    // Tentar enviar email para o paciente, mas não falhar se der erro
    try {
      await sendEmail({
        to: user.email!,
        subject: isNewUser ? 'Bem-vindo(a) e Confirmação de Pré-Agendamento' : 'Confirmação de Pré-Agendamento - Jandira C. Frederick',
        html: patientEmailHtml,
        attachments: icsAttachment,
      });
      console.log('[AGENDAMENTOS][POST] Email enviado para o paciente:', user.email);
    } catch (emailError) {
      console.error('[AGENDAMENTOS][POST] Erro ao enviar email para o paciente:', emailError);
      // Não falhar o agendamento por causa do email
    }

    // Tentar enviar email para o administrador, mas não falhar se der erro
    try {
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
            <li><strong>Motivo da Consulta:</strong> ${motivoConsulta || 'Não informado'}</li>
          </ul>
          <p>Acesse o painel administrativo para mais detalhes e para confirmar o agendamento.</p>
        `,
      });
      console.log('[AGENDAMENTOS][POST] Email enviado para o administrador');
    } catch (emailError) {
      console.error('[AGENDAMENTOS][POST] Erro ao enviar email para o administrador:', emailError);
      // Não falhar o agendamento por causa do email
    }
    // --- Fim do Envio de E-mails ---

    console.log('[AGENDAMENTOS][POST] Agendamento finalizado com sucesso');

    return NextResponse.json({ 
      message: 'Seu pré-agendamento foi realizado com sucesso! Um e-mail de confirmação foi enviado.', 
      agendamento,
      user: { id: user.id, email: user.email, role: user.role }
    }, { status: 201 });

  } catch (error) {
    console.error('[AGENDAMENTOS][POST] Erro ao criar agendamento:', error);
    return new NextResponse(JSON.stringify({ error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.', details: error }), { status: 500 });
  }
}