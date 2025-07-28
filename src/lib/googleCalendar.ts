import { google } from 'googleapis';

// Validação das variáveis de ambiente
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Verificar se as variáveis necessárias estão configuradas
if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
  console.warn('⚠️ Google Calendar API não configurada. Verifique as variáveis de ambiente:');
  console.warn('- GOOGLE_CLIENT_EMAIL:', !!GOOGLE_CLIENT_EMAIL);
  console.warn('- GOOGLE_PRIVATE_KEY:', !!GOOGLE_PRIVATE_KEY);
  console.warn('- GOOGLE_CALENDAR_ID:', !!GOOGLE_CALENDAR_ID);
}

// Configuração da autenticação
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_CLIENT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
});

const calendar = google.calendar({
  version: 'v3',
  auth,
});

interface CalendarEvent {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string }[];
}

export async function createCalendarEvent(event: CalendarEvent) {
  // Verificar se as variáveis estão configuradas
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    console.error('❌ Google Calendar API não configurada. Evento não criado.');
    return null;
  }

  try {
    console.log('📅 Criando evento no Google Calendar:', {
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
      attendees: event.attendees?.length || 0
    });

    const response = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: {
        ...event,
        // Adicionar configurações extras para melhor compatibilidade
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 horas antes
            { method: 'popup', minutes: 30 }, // 30 minutos antes
          ],
        },
        // Configurar como evento confirmado
        status: 'confirmed',
      },
    });

    console.log('✅ Evento criado com sucesso:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao criar evento no Google Calendar:', {
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });

    // Tratamento específico de erros comuns
    if (error.code === 403) {
      console.error('❌ Erro 403: Verifique se a conta de serviço tem permissão no calendário');
    } else if (error.code === 400) {
      console.error('❌ Erro 400: Verifique o formato dos dados do evento');
    } else if (error.code === 404) {
      console.error('❌ Erro 404: Calendário não encontrado');
    }

    return null;
  }
}

export async function updateCalendarEvent(eventId: string, event: CalendarEvent) {
  // Verificar se as variáveis estão configuradas
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    console.error('❌ Google Calendar API não configurada. Evento não atualizado.');
    return null;
  }

  try {
    console.log('📅 Atualizando evento no Google Calendar:', {
      eventId,
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime
    });

    const response = await calendar.events.update({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: {
        ...event,
        // Manter configurações de lembretes
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
        status: 'confirmed',
      },
    });

    console.log('✅ Evento atualizado com sucesso:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao atualizar evento no Google Calendar:', {
      eventId,
      error: error.message,
      code: error.code,
      status: error.status
    });

    // Tratamento específico de erros
    if (error.code === 404) {
      console.error('❌ Evento não encontrado no Google Calendar');
    } else if (error.code === 403) {
      console.error('❌ Sem permissão para atualizar o evento');
    }

    return null;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  // Verificar se as variáveis estão configuradas
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    console.error('❌ Google Calendar API não configurada. Evento não deletado.');
    return false;
  }

  try {
    console.log('📅 Deletando evento no Google Calendar:', eventId);

    await calendar.events.delete({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId,
    });

    console.log('✅ Evento deletado com sucesso:', eventId);
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao deletar evento no Google Calendar:', {
      eventId,
      error: error.message,
      code: error.code,
      status: error.status
    });

    // Tratamento específico de erros
    if (error.code === 404) {
      console.error('❌ Evento não encontrado no Google Calendar');
    } else if (error.code === 403) {
      console.error('❌ Sem permissão para deletar o evento');
    }

    return false;
  }
}

// Função auxiliar para verificar se a API está configurada
export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_CALENDAR_ID);
}

// Função para testar a conexão com a API
export async function testGoogleCalendarConnection(): Promise<boolean> {
  if (!isGoogleCalendarConfigured()) {
    console.error('❌ Google Calendar API não configurada');
    return false;
  }

  try {
    console.log('🧪 Testando conexão com Google Calendar API...');
    
    // Tentar listar eventos (apenas 1) para testar a conexão
    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      maxResults: 1,
      timeMin: new Date().toISOString(),
    });

    console.log('✅ Conexão com Google Calendar API bem-sucedida');
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao testar conexão com Google Calendar API:', {
      error: error.message,
      code: error.code,
      status: error.status
    });
    return false;
  }
}
