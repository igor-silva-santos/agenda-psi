import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function PUT(request: Request, { params }: { params: { id: number } }) {
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
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  try {
    const { id } = params;
    const { diaDaSemana, horaInicio, horaFim } = await request.json();

    if (!id || diaDaSemana === undefined || !horaInicio || !horaFim) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          missingFields: [
            !id && 'id',
            diaDaSemana === undefined && 'diaDaSemana',
            !horaInicio && 'horaInicio',
            !horaFim && 'horaFim'
          ].filter(Boolean)
        }
      }, { status: 400 });
    }

    const { data: updatedHorarioAtuacao, error: updateError } = await supabase
      .from('HorarioAtuacao')
      .update({
        diaDaSemana: parseInt(diaDaSemana),
        horaInicio,
        horaFim,
      })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedHorarioAtuacao);
  } catch (error) {
    console.error('Erro ao atualizar horário de atuação:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
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
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ 
        error: 'Missing ID parameter',
        details: { missingField: 'id' }
      }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('HorarioAtuacao')
      .delete()
      .eq('id', id);
    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Horário de atuação deletado com sucesso' }, { status: 204 });
  } catch (error) {
    console.error('Erro ao deletar horário de atuação:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
