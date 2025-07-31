import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  console.log('[HORARIOS-ATUACAO][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[HORARIOS-ATUACAO][GET] Token ausente');
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
    console.warn('[HORARIOS-ATUACAO][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    console.warn('[HORARIOS-ATUACAO][GET] Sessão inválida ou usuário não é admin', { session });
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }
  try {
    const { data: horariosAtuacao, error: horariosError } = await supabase
      .from('HorarioAtuacao')
      .select('*')
      .order('diaDaSemana', { ascending: true })
      .order('horaInicio', { ascending: true });
    if (horariosError) {
      throw horariosError;
    }
    return NextResponse.json(horariosAtuacao);
  } catch (error) {
    console.error('[HORARIOS-ATUACAO][GET] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao buscar horários de atuação',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  try {
    const { diaDaSemana, horaInicio, horaFim, almocoInicio, almocoFim } = await request.json();

    if (diaDaSemana === undefined || !horaInicio || !horaFim) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          missingFields: [
            diaDaSemana === undefined && 'diaDaSemana',
            !horaInicio && 'horaInicio',
            !horaFim && 'horaFim'
          ].filter(Boolean)
        }
      }, { status: 400 });
    }

    const { data: novoHorarioAtuacao, error: createError } = await supabase
      .from('HorarioAtuacao')
      .insert([
        {
          diaDaSemana: parseInt(diaDaSemana),
          horaInicio,
          horaFim,
          almocoInicio,
          almocoFim,
        },
      ])
      .select()
      .single();
    if (createError) {
      throw createError;
    }

    return NextResponse.json(novoHorarioAtuacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar horário de atuação:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
