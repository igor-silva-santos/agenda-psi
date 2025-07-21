import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format, isPast, parseISO, startOfDay } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get('start');
  const endDateParam = searchParams.get('end');

  if (!startDateParam || !endDateParam) {
    return new NextResponse('Missing start or end date parameters', { status: 400 });
  }

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  try {
    const [bookableSlots, blockedPeriods] = await Promise.all([
      prisma.bookableSlot.findMany({
        where: {
          startDateTime: {
            gte: startDate,
            lte: endDate,
          },
          isBooked: false, // Apenas slots não agendados
        },
        orderBy: {
          startDateTime: 'asc',
        },
      }),
      prisma.horarioBloqueado.findMany({
        where: {
          dataHoraInicio: { lte: endDate },
          dataHoraFim: { gte: startDate },
        },
      }),
    ]);

    const availableSlots: { [key: string]: string[] } = {};
    const now = new Date();

    bookableSlots.forEach(slot => {
      const slotStart = parseISO(slot.startDateTime.toISOString());
      const slotEnd = parseISO(slot.endDateTime.toISOString());
      const dateString = format(slotStart, 'yyyy-MM-dd');
      const timeString = format(slotStart, 'HH:mm');

      // Verifica se o slot já passou
      if (isPast(slotStart) && !startOfDay(slotStart).toDateString().includes(startOfDay(now).toDateString())) {
        return; // Ignora slots que já passaram, a menos que seja hoje
      }

      // Verifica se o slot está dentro de um período bloqueado
      const isBlocked = blockedPeriods.some(block => {
        const blockStart = parseISO(block.dataHoraInicio.toISOString());
        const blockEnd = parseISO(block.dataHoraFim.toISOString());
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}