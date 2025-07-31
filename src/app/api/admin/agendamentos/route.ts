import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  console.log('[AGENDAMENTOS][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[AGENDAMENTOS][GET] Token ausente');
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Token ausente' }
    }, { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    console.warn('[AGENDAMENTOS][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    console.warn('[AGENDAMENTOS][GET] Sessão inválida ou usuário não é admin', { session });
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const range = searchParams.get('range');
  let filters: any = {};
  if (status) {
    filters.status = status;
  }
  const now = new Date();
  if (range) {
    let startDate, endDate;
    if (range === 'day') {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
    } else if (range === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else if (range === 'month') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }
    if (startDate && endDate) {
      filters.dataHora = `gte.${startDate.toISOString()},lte.${endDate.toISOString()}`;
    }
  }
  try {
    let query = supabase
      .from('Agendamento')
      .select('*, user:User(*)')
      .order('dataHora', { ascending: true });
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.dataHora) {
      const [gte, lte] = filters.dataHora.replace('gte.', '').replace('lte.', '').split(',');
      query = query.gte('dataHora', gte).lte('dataHora', lte);
    }
    const { data: agendamentos, error: agendamentoError } = await query;
    if (agendamentoError) {
      throw agendamentoError;
    }
    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error('[AGENDAMENTOS][GET] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao buscar agendamentos',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
