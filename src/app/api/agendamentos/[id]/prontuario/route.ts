import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Buscar prontuário de um agendamento
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: prontuario, error } = await supabase
      .from('Prontuario')
      .select('*')
      .eq('agendamentoId', params.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ 
        error: 'Erro ao buscar prontuário',
        details: { agendamentoId: params.id, message: error.message }
      }, { status: 500 });
    }
    
    return NextResponse.json(prontuario);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao buscar prontuário',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}

// Salvar ou atualizar prontuário de um agendamento
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
    const { data: existing, error: findError } = await supabase
      .from('Prontuario')
      .select('*')
      .eq('agendamentoId', params.id)
      .single();
    
    let prontuario;
    if (existing) {
      // Atualizar prontuário existente
      const { data: updated, error: updateError } = await supabase
        .from('Prontuario')
        .update({ texto })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (updateError) {
        return NextResponse.json({ 
          error: 'Erro ao atualizar prontuário',
          details: { prontuarioId: existing.id, message: updateError.message }
        }, { status: 500 });
      }
      
      prontuario = updated;
    } else {
      // Criar novo prontuário
      const { data: created, error: createError } = await supabase
        .from('Prontuario')
        .insert([{ agendamentoId: params.id, texto }])
        .select()
        .single();
      
      if (createError) {
        return NextResponse.json({ 
          error: 'Erro ao criar prontuário',
          details: { agendamentoId: params.id, message: createError.message }
        }, { status: 500 });
      }
      
      prontuario = created;
    }
    
    return NextResponse.json(prontuario);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao processar prontuário',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
} 