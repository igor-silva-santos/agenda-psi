import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { format, isPast, parseISO, startOfDay } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get('start');
  const endDateParam = searchParams.get('end');

  if (!startDateParam || !endDateParam) {
    return NextResponse.json({ 
      error: 'Missing start or end date parameters',
      details: {
        missingParams: [
          !startDateParam && 'start',
          !endDateParam && 'end'
        ].filter(Boolean)
      }
    }, { status: 400 });
  }

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  try {
    const [{ data: bookableSlots, error: slotsError }, { data: blockedPeriods, error: blockedError }] = await Promise.all([
      supabase
        .from('BookableSlot')
        .select('*')
        .gte('startDateTime', startDate.toISOString())
        .lte('startDateTime', endDate.toISOString())
        .eq('isBooked', false)
        .order('startDateTime', { ascending: true }),
      supabase
        .from('HorarioBloqueado')
        .select('*')
        .lte('dataHoraInicio', endDate.toISOString())
        .gte('dataHoraFim', startDate.toISOString()),
    ]);
    if (slotsError) throw slotsError;
    if (blockedError) throw blockedError;

    const availableSlots: { [key: string]: string[] } = {};
    const now = new Date();

    (bookableSlots || []).forEach(slot => {
      const slotStart = parseISO(new Date(slot.startDateTime).toISOString());
      const slotEnd = parseISO(new Date(slot.endDateTime).toISOString());
      const dateString = format(slotStart, 'yyyy-MM-dd');
      const timeString = format(slotStart, 'HH:mm');

      // Verifica se o slot já passou
      if (isPast(slotStart) && !startOfDay(slotStart).toDateString().includes(startOfDay(now).toDateString())) {
        return; // Ignora slots que já passaram, a menos que seja hoje
      }

      // Verifica se o slot está dentro de um período bloqueado
      const isBlocked = (blockedPeriods || []).some(block => {
        const blockStart = parseISO(new Date(block.dataHoraInicio).toISOString());
        const blockEnd = parseISO(new Date(block.dataHoraFim).toISOString());
        return (slotStart >= blockStart && slotStart < blockEnd) ||
               (slotEnd > blockStart && slotEnd <= blockEnd) ||
               (slotStart < blockStart && slotEnd > blockEnd);
      });

      if (!isBlocked) {
        if (!availableSlots[dateString]) {
          availableSlots[dateString] = [];
        }
        availableSlots[dateString].push(timeString);
      }
    });

    // Garante que os horários dentro de cada dia estejam ordenados
    for (const date in availableSlots) {
      availableSlots[date].sort();
    }

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}