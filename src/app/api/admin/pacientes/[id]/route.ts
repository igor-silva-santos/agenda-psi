import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  console.log('[PACIENTES][GET][id] Início da requisição', { params });
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PACIENTES][GET][id] Token ausente');
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
    console.warn('[PACIENTES][GET][id] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    console.warn('[PACIENTES][GET][id] Sessão inválida ou usuário não é admin', { session });
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }
  const { id } = params;
  try {
    const { data: paciente, error: pacienteError } = await supabase
      .from('User')
      .select('*, agendamentos:Agendamento(*)')
      .eq('id', id)
      .eq('role', 'PACIENTE')
      .single();
    if (pacienteError || !paciente) {
      return NextResponse.json({ 
        error: 'Paciente não encontrado',
        details: { pacienteId: id }
      }, { status: 404 });
    }
    return NextResponse.json(paciente);
  } catch (error) {
    console.error('[PACIENTES][GET][id] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao buscar paciente',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
