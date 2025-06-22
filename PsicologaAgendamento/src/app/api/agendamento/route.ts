import { NextRequest, NextResponse } from 'next/server';

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

    // Simular horários ocupados (em produção, buscar do Firestore)
    const occupiedSlots: { [key: string]: string[] } = {
      '2024-06-15': ['09:00', '14:00'],
      '2024-06-16': ['10:00', '15:00'],
    };

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

    // Simular criação do agendamento
    // Em produção, salvar no Firestore e integrar com Google Calendar
    const appointmentId = `apt_${Date.now()}`;
    
    console.log('Novo agendamento criado:', {
      appointmentId,
      nome,
      telefone,
      email,
      motivo,
      data,
      horario
    });

    // WhatsApp desativado conforme solicitado
    console.log('WhatsApp notification disabled - would send to:', telefone);

    return NextResponse.json({
      success: true,
      appointmentId,
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

