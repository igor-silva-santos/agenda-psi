import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: agendamentos, error } = await supabase
      .from('Agendamento')
      .select('*, user:User(*)')
      .order('dataHora', { ascending: true });
    if (error) throw error;
    return NextResponse.json(agendamentos);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
