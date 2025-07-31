import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';

const horarioBloqueadoSchema = z.object({
  dataHoraInicio: z.string().datetime(),
  dataHoraFim: z.string().datetime(),
  // motivo: z.string().optional(), // Removido pois não existe no schema
});

export async function GET(request: Request) {
  console.log('[HORARIOS-BLOQUEADOS][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[HORARIOS-BLOQUEADOS][GET] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    console.warn('[HORARIOS-BLOQUEADOS][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    console.warn('[HORARIOS-BLOQUEADOS][GET] Sessão inválida ou usuário não é admin', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const { data: horariosBloqueados, error: horariosError } = await supabase
      .from('HorarioBloqueado')
      .select('*')
      .order('dataHoraInicio', { ascending: false });
    if (horariosError) {
      throw horariosError;
    }
    return NextResponse.json(horariosBloqueados);
  } catch (error) {
    console.error('[HORARIOS-BLOQUEADOS][GET] ERRO:', error);
    return new NextResponse('Erro interno ao buscar horários bloqueados', { status: 500 });
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
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = horarioBloqueadoSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Dados inválidos', details: validation.error.format() }), { status: 400 });
    }

    const { dataHoraInicio, dataHoraFim } = validation.data;

    const { data: newHorarioBloqueado, error: createError } = await supabase
      .from('HorarioBloqueado')
      .insert([
        {
          dataHoraInicio: new Date(dataHoraInicio),
          dataHoraFim: new Date(dataHoraFim),
        },
      ])
      .select()
      .single();
    if (createError) {
      throw createError;
    }

    return NextResponse.json(newHorarioBloqueado, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar horário bloqueado:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
