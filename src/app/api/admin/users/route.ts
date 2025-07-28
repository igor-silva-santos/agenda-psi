import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  console.log('[USERS][GET] Início da requisição');
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    let query = supabase
      .from('User')
      .select('id, name, email, role');
    if (role) {
      query = query.eq('role', role);
    }
    const { data: users, error } = await query;
    if (error) throw error;
    return NextResponse.json(users);
  } catch (error) {
    console.error('[USERS][GET] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao buscar usuários',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}