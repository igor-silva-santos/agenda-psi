import { NextRequest, NextResponse } from 'next/server';

interface TimeSlot {
  start: string;
  end: string;
}

interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    slots: TimeSlot[];
  };
}

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const startTime = new Date(`2000-01-01T${start}:00`);
  const endTime = new Date(`2000-01-01T${end}:00`);
  
  const current = new Date(startTime);
  
  while (current < endTime) {
    slots.push(current.toTimeString().slice(0, 5));
    current.setHours(current.getHours() + 1);
  }
  
  return slots;
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

    // Carregar horários de trabalho configurados (simulado, em produção buscar do Firestore)
    const workingHours: WorkingHours = {
      monday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      tuesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }] },
      wednesday: { enabled: false, slots: [] },
      thursday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }] },
      friday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    };

    // Gerar slots disponíveis baseados na configuração
    const availableSlots: { [key: string]: string[] } = {};
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = daysOfWeek[date.getDay()];
      
      const dayConfig = workingHours[dayOfWeek];
      
      if (dayConfig && dayConfig.enabled && dayConfig.slots.length > 0) {
        const daySlots: string[] = [];
        
        dayConfig.slots.forEach(slot => {
          const slotTimes = generateTimeSlots(slot.start, slot.end);
          daySlots.push(...slotTimes);
        });
        
        if (daySlots.length > 0) {
          availableSlots[dateStr] = daySlots;
        }
      }
    }

    // Simular alguns horários ocupados para demonstração
    const occupiedSlots: { [key: string]: string[] } = {
      '2024-06-10': ['09:00', '15:00'],
      '2024-06-11': ['10:00', '16:00'],
    };

    // Remover horários ocupados dos disponíveis
    Object.keys(occupiedSlots).forEach(dateStr => {
      if (availableSlots[dateStr]) {
        availableSlots[dateStr] = availableSlots[dateStr].filter(
          time => !occupiedSlots[dateStr].includes(time)
        );
        
        // Remover datas sem horários disponíveis
        if (availableSlots[dateStr].length === 0) {
          delete availableSlots[dateStr];
        }
      }
    });

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}