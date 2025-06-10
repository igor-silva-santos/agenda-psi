import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Configuração do Google Calendar
const calendar = google.calendar('v3');

// Em produção, essas credenciais devem vir de variáveis de ambiente
const GOOGLE_CREDENTIALS = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  calendar_id: process.env.GOOGLE_CALENDAR_ID,
};

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  
  return auth.getClient();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Parâmetros start e end são obrigatórios' },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient();
    
    // Buscar eventos existentes no período
    const response = await calendar.events.list({
      auth: authClient,
      calendarId: GOOGLE_CREDENTIALS.calendar_id,
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Converter eventos para formato de horários ocupados
    const occupiedSlots: { [key: string]: string[] } = {};
    
    events.forEach(event => {
      if (event.start?.dateTime) {
        const startDateTime = new Date(event.start.dateTime);
        const dateStr = startDateTime.toISOString().split('T')[0];
        const timeStr = startDateTime.toTimeString().slice(0, 5);
        
        if (!occupiedSlots[dateStr]) {
          occupiedSlots[dateStr] = [];
        }
        occupiedSlots[dateStr].push(timeStr);
      }
    });

    return NextResponse.json({ occupiedSlots });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone, email, motivo, data, horario } = body;

    if (!nome || !telefone || !data || !horario) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient();
    
    // Criar data/hora do evento
    const eventDate = new Date(data);
    const [hours, minutes] = horario.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDate = new Date(eventDate);
    endDate.setMinutes(endDate.getMinutes() + 50); // Consulta de 50 minutos

    // Criar evento no Google Calendar
    const event = {
      summary: `Consulta - ${nome}`,
      description: `
        Paciente: ${nome}
        Telefone: ${telefone}
        ${email ? `E-mail: ${email}` : ''}
        ${motivo ? `Motivo: ${motivo}` : ''}
      `.trim(),
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: email ? [{ email }] : [],
    };

    const response = await calendar.events.insert({
      auth: authClient,
      calendarId: GOOGLE_CREDENTIALS.calendar_id,
      requestBody: event,
    });

    // Aqui seria enviada a notificação por WhatsApp
    // await sendWhatsAppNotification(telefone, nome, eventDate);

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      message: 'Agendamento criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    );
  }
}

// Função para enviar notificação por WhatsApp (implementação futura)
async function sendWhatsAppNotification(telefone: string, nome: string, data: Date) {
  // Implementar integração com Twilio ou WhatsApp Business API
  console.log(`Enviando notificação para ${telefone}: Consulta agendada para ${nome} em ${data}`);
}

