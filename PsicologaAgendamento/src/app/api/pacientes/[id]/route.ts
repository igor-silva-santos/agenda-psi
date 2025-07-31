import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('cpf', params.id)
      .single();
      
    if (error || !user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado.',
        details: { cpf: params.id }
      }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao buscar usuário.',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
} 