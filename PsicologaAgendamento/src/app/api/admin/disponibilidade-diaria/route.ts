import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    console.warn('[DISPONIBILIDADE-DIARIA][GET] Sessão inválida ou usuário não é admin', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const { data: disponibilidades, error: dispError } = await supabase
      .from('DisponibilidadeDiaria')
      .select('*')
      .order('data', { ascending: false });
    if (dispError) throw dispError;
    return new NextResponse(JSON.stringify(disponibilidades), { status: 200 });
  } catch (error) {
    console.error('[DISPONIBILIDADE-DIARIA][GET] ERRO:', error);
    return new NextResponse('Erro interno ao buscar disponibilidades diárias', { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { data, horaInicio, horaFim, almocoInicio, almocoFim } = await request.json();
    if (!data || !horaInicio || !horaFim) {
      return new NextResponse('data, horaInicio e horaFim são obrigatórios', { status: 400 });
    }

    const targetDate = new Date(data);
    targetDate.setUTCHours(0, 0, 0, 0);

    const { data: existingEntry } = await supabase
      .from('DisponibilidadeDiaria')
      .select('*')
      .eq('data', targetDate.toISOString())
      .single();

    if (existingEntry) {
      return new NextResponse('Availability entry already exists for this date', { status: 409 });
    }

    const { data: newEntry, error: createError } = await supabase
      .from('DisponibilidadeDiaria')
      .insert([
        {
          data: targetDate.toISOString(),
          horaInicio,
          horaFim,
          almocoInicio,
          almocoFim,
        },
      ])
      .select()
      .single();
    if (createError) throw createError;

    return new NextResponse(JSON.stringify(newEntry), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar disponibilidade diária:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
