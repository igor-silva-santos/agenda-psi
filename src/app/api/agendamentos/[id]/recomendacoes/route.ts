import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Buscar recomendação de um agendamento
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: recomendacao, error } = await supabase
      .from('Recomendacao')
      .select('*')
      .eq('agendamentoId', params.id)
      .single();
    if (error) {
      return NextResponse.json({ 
        error: 'Erro ao buscar recomendação',
        details: { agendamentoId: params.id, message: error.message }
      }, { status: 500 });
    }
    return NextResponse.json(recomendacao);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao buscar recomendação',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}

// Salvar ou atualizar recomendação de um agendamento
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }
  
  try {
    const { texto } = await request.json();
    // Busca se já existe
    const { data: existing } = await supabase
      .from('Recomendacao')
      .select('*')
      .eq('agendamentoId', params.id)
      .single();
    let recomendacao;
    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('Recomendacao')
        .update({ texto })
        .eq('id', existing.id)
        .select()
        .single();
      if (updateError) {
        return NextResponse.json({ 
          error: 'Erro ao atualizar recomendação',
          details: { recomendacaoId: existing.id, message: updateError.message }
        }, { status: 500 });
      }
      recomendacao = updated;
    } else {
      const { data: created, error: createError } = await supabase
        .from('Recomendacao')
        .insert([{ agendamentoId: params.id, texto }])
        .select()
        .single();
      if (createError) {
        return NextResponse.json({ 
          error: 'Erro ao criar recomendação',
          details: { agendamentoId: params.id, message: createError.message }
        }, { status: 500 });
      }
      recomendacao = created;
    }
    return NextResponse.json(recomendacao);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao processar recomendação',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}