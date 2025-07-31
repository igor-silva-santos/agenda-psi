import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
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
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user.role !== 'PACIENTE' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não tem permissão', userRole: session?.user?.role }
    }, { status: 401 });
  }

  const { id } = params;

  try {
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('Agendamento')
      .select('*')
      .eq('id', id)
      .eq('userId', session.user.id)
      .single();
    if (agendamentoError || !agendamento) {
      return NextResponse.json({ 
        error: 'Agendamento não encontrado ou não autorizado',
        details: { agendamentoId: id, userId: session.user.id }
      }, { status: 404 });
    }

    const { data: updatedAgendamento, error: updateError } = await supabase
      .from('Agendamento')
      .update({ status: 'CONFIRMADO' })
      .eq('id', id)
      .select()
      .single();
    if (updateError || !updatedAgendamento) {
      return NextResponse.json({ 
        error: 'Erro ao confirmar agendamento',
        details: { agendamentoId: id, message: updateError?.message }
      }, { status: 500 });
    }

    return NextResponse.json(updatedAgendamento);
  } catch (error) {
    console.error(`Erro ao confirmar o agendamento ${id}:`, error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
