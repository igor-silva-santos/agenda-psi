import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lidaParam = searchParams.get('lida');

    let query = supabase
      .from('Notificacao')
      .select('*')
      .eq('userId', session.user.id)
      .order('dataCriacao', { ascending: false });

    if (lidaParam !== null) {
      query = query.eq('lida', lidaParam === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
