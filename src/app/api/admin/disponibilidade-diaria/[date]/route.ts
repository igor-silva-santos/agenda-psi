import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request, { params }: { params: { date: string } }) {
  console.log('[DISPONIBILIDADE-DIARIA][GET][date] Início da requisição', { params });
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET][date] Token ausente');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET][date] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    console.warn('[DISPONIBILIDADE-DIARIA][GET][date] Sessão inválida ou usuário não é admin', { session });
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const date = params.date;
    if (!date) {
      return new NextResponse('Missing date parameter', { status: 400 });
    }
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    console.log('[DISPONIBILIDADE-DIARIA][GET][date] Buscando disponibilidade para data:', targetDate);
    const { data: existingEntry, error: dispError } = await supabase
      .from('DisponibilidadeDiaria')
      .select('*')
      .eq('data', targetDate.toISOString())
      .single();
    if (dispError) throw dispError;
    if (!existingEntry) {
      return new NextResponse('No availability entry found for this date', { status: 404 });
    }
    return new NextResponse(JSON.stringify(existingEntry), { status: 200 });
  } catch (error) {
    console.error('[DISPONIBILIDADE-DIARIA][GET][date] ERRO:', error);
    return new NextResponse('Erro interno ao buscar disponibilidade diária', { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { date: string } }) {
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
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const date = params.date;
    if (!date) {
      return new NextResponse('Missing date parameter', { status: 400 });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const { data: existingEntry } = await supabase
      .from('DisponibilidadeDiaria')
      .select('*')
      .eq('data', targetDate.toISOString())
      .single();

    if (existingEntry) {
      return new NextResponse('Availability entry already exists for this date', { status: 409 });
    }

    // Receber os campos obrigatórios do body
    const { horaInicio, horaFim, almocoInicio, almocoFim } = await request.json();
    if (!horaInicio || !horaFim) {
      return new NextResponse('horaInicio e horaFim são obrigatórios', { status: 400 });
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

export async function DELETE(
  request: Request,
  { params }: { params: { date: string } }
) {
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
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const date = params.date;
    if (!date) {
      return new NextResponse('Missing date parameter', { status: 400 });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const { data: existingEntry } = await supabase
      .from('DisponibilidadeDiaria')
      .select('*')
      .eq('data', targetDate.toISOString())
      .single();

    if (!existingEntry) {
      return new NextResponse('No availability entry found for this date', { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('DisponibilidadeDiaria')
      .delete()
      .eq('id', existingEntry.id);
    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao deletar disponibilidade diária:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
