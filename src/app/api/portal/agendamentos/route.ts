import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  console.log('[PORTAL-AGENDAMENTOS][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PORTAL-AGENDAMENTOS][GET] Token ausente');
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
    console.warn('[PORTAL-AGENDAMENTOS][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'PACIENTE' && session.user.role !== 'ADMIN')) {
    console.warn('[PORTAL-AGENDAMENTOS][GET] Sessão inválida ou usuário não tem permissão', { session });
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não tem permissão', userRole: session?.user?.role }
    }, { status: 401 });
  }
  try {
    const { data: agendamentos, error: agendamentoError } = await supabase
      .from('Agendamento')
      .select('*')
      .eq('userId', session.user.id)
      .order('dataHora', { ascending: true });
    if (agendamentoError) {
      throw agendamentoError;
    }
    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error('[PORTAL-AGENDAMENTOS][GET] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao buscar agendamentos do paciente',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
