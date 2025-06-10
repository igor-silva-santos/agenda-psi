import { NextRequest, NextResponse } from 'next/server';

// Configuração do WhatsApp (Twilio ou WhatsApp Business API)
const WHATSAPP_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER, // Ex: whatsapp:+14155238886
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefone, nome, data, horario, tipo } = body;

    if (!telefone || !nome || !data || !horario) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Formatar data para exibição
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let mensagem = '';

    if (tipo === 'confirmacao') {
      mensagem = `
🩺 *Consulta Agendada - Dra. Jandira*

Olá, ${nome}! Sua consulta foi agendada com sucesso.

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${horario}
📍 *Local:* Rua das Flores, 123 - São Paulo/SP

*Informações importantes:*
• Chegue 10 minutos antes do horário
• Traga um documento com foto
• Em caso de cancelamento, avise com 24h de antecedência

Para dúvidas, responda esta mensagem.

Aguardamos você! 😊
      `.trim();
    } else if (tipo === 'lembrete') {
      mensagem = `
🔔 *Lembrete de Consulta - Dra. Jandira*

Olá, ${nome}! Lembramos que você tem consulta agendada para amanhã.

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${horario}
📍 *Local:* Rua das Flores, 123 - São Paulo/SP

Nos vemos em breve! 😊

Para cancelar ou remarcar, responda esta mensagem.
      `.trim();
    }

    // Simular envio (em produção, usar Twilio ou WhatsApp Business API)
    console.log(`Enviando WhatsApp para ${telefone}:`, mensagem);

    // Implementação real com Twilio:
    /*
    const client = require('twilio')(WHATSAPP_CONFIG.accountSid, WHATSAPP_CONFIG.authToken);
    
    await client.messages.create({
      from: WHATSAPP_CONFIG.whatsappNumber,
      to: `whatsapp:+55${telefone.replace(/\D/g, '')}`,
      body: mensagem,
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Notificação enviada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}

