import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { format, parseISO, setHours, setMinutes, addHours, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { getToken } from 'next-auth/jwt';

// Helper function to generate time slots
const generateTimeSlots = (
  date: Date,
  horaInicio: string,
  horaFim: string,
  almocoInicio?: string,
  almocoFim?: string
) => {
  const slots = [];
  let current = setMinutes(setHours(date, parseInt(horaInicio.split(':')[0])), parseInt(horaInicio.split(':')[1]));
  const end = setMinutes(setHours(date, parseInt(horaFim.split(':')[0])), parseInt(horaFim.split(':')[1]));

  let lunchStart: Date | undefined;
  let lunchEnd: Date | undefined;

  if (almocoInicio && almocoFim) {
    lunchStart = setMinutes(setHours(date, parseInt(almocoInicio.split(':')[0])), parseInt(almocoInicio.split(':')[1]));
    lunchEnd = setMinutes(setHours(date, parseInt(almocoFim.split(':')[0])), parseInt(almocoFim.split(':')[1]));
  }

  while (isBefore(current, end)) {
    const slotEnd = addHours(current, 1); // 1-hour slots

    // Check if the current slot overlaps with lunch
    const isDuringLunch = lunchStart && lunchEnd && (
      isWithinInterval(current, { start: lunchStart, end: lunchEnd }) ||
      isWithinInterval(slotEnd, { start: lunchStart, end: lunchEnd }) ||
      (isBefore(lunchStart, current) && isAfter(lunchEnd, slotEnd)) // Lunch interval completely covers the slot
    );

    if (!isDuringLunch && (isBefore(slotEnd, end) || (isBefore(slotEnd, end) && isWithinInterval(slotEnd, {start: current, end: end})))) { // Ensure slot doesn't go past end time
      slots.push({
        start: format(current, 'HH:mm'),
        end: format(slotEnd, 'HH:mm'),
      });
    }
    current = slotEnd;
  }
  return slots;
};


export async function GET(request: Request) {
  console.log('[DISPONIBILIDADE-DIARIA][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  console.log('[DISPONIBILIDADE-DIARIA][GET] session:', session);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET] Sessão inválida ou usuário não é admin', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    if (!dateParam) {
      console.log('[DISPONIBILIDADE-DIARIA][GET] Listando todas as disponibilidades diárias');
      const disponibilidades = await prisma.disponibilidadeDiaria.findMany({
        orderBy: {
          data: 'asc',
        },
      });
      return NextResponse.json({ disponibilidades });
    }
    const targetDate = parseISO(dateParam);
    targetDate.setUTCHours(0, 0, 0, 0);
    console.log('[DISPONIBILIDADE-DIARIA][GET] Buscando disponibilidade para data:', targetDate);
    const disponibilidade = await prisma.disponibilidadeDiaria.findUnique({
      where: { data: targetDate },
    });
    const slots = await prisma.bookableSlot.findMany({
      where: {
        startDateTime: {
          gte: targetDate,
          lt: addHours(targetDate, 24),
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });
    return NextResponse.json({ disponibilidade, slots });
  } catch (error) {
    console.error('[DISPONIBILIDADE-DIARIA][GET] ERRO:', error);
    return new NextResponse('Erro interno ao buscar disponibilidade diária', { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { date, horaInicio, horaFim, almocoInicio, almocoFim } = await request.json();

    if (!date || !horaInicio || !horaFim) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const parsedDate = parseISO(date); // Use parseISO for yyyy-MM-dd format
    parsedDate.setUTCHours(0, 0, 0, 0);

    const generatedHorarios = generateTimeSlots(parsedDate, horaInicio, horaFim, almocoInicio, almocoFim);

    const existingEntry = await prisma.disponibilidadeDiaria.findUnique({
      where: { data: parsedDate },
    });

    let result;
    if (existingEntry) {
      result = await prisma.disponibilidadeDiaria.update({
        where: { id: existingEntry.id },
        data: {
          almocoInicio: almocoInicio || null,
          almocoFim: almocoFim || null,
        },
      });
    } else {
      result = await prisma.disponibilidadeDiaria.create({
        data: {
          data: parsedDate,
          horaInicio,
          horaFim,
          almocoInicio: almocoInicio || null,
          almocoFim: almocoFim || null,
        },
      });
    }

    // Remove existing bookable slots for this date
    await prisma.bookableSlot.deleteMany({
      where: {
        startDateTime: {
          gte: parsedDate,
          lt: addHours(parsedDate, 24), // Up to the next day
        },
      },
    });

    // Create new bookable slots based on generatedHorarios
    const newBookableSlots = generatedHorarios.map((slot: any) => ({
      startDateTime: setMinutes(setHours(parsedDate, parseInt(slot.start.split(':')[0])), parseInt(slot.start.split(':')[1])),
      endDateTime: setMinutes(setHours(parsedDate, parseInt(slot.end.split(':')[0])), parseInt(slot.end.split(':')[1])),
    }));

    await prisma.bookableSlot.createMany({
      data: newBookableSlots,
    });

    return NextResponse.json(result, { status: existingEntry ? 200 : 201 });
  } catch (error) {
    console.error('Erro ao salvar disponibilidade diária:', error);
    if (error instanceof Error) {
      return new NextResponse('Erro ao salvar disponibilidade diária: ' + error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
