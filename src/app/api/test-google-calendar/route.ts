import { NextResponse } from 'next/server';
import { testGoogleCalendarConnection, isGoogleCalendarConfigured } from '@/lib/googleCalendar';

export async function GET() {
  try {
    console.log('🧪 Iniciando teste da API do Google Calendar...');

    // Verificar se as variáveis estão configuradas
    const isConfigured = isGoogleCalendarConfigured();
    
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Google Calendar API não configurada',
        details: {
          message: 'Verifique as variáveis de ambiente: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID',
          missingVariables: {
            GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
            GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
            GOOGLE_CALENDAR_ID: !!process.env.GOOGLE_CALENDAR_ID,
          }
        }
      }, { status: 400 });
    }

    // Testar conexão com a API
    const connectionTest = await testGoogleCalendarConnection();

    if (connectionTest) {
      return NextResponse.json({
        success: true,
        message: 'Google Calendar API funcionando corretamente',
        details: {
          configured: true,
          connectionTest: true
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Falha na conexão com Google Calendar API',
        details: {
          configured: true,
          connectionTest: false,
          message: 'Verifique as credenciais e permissões da conta de serviço'
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Erro no teste da API do Google Calendar:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste da API',
      details: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
} 