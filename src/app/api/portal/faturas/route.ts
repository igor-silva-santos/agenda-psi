import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('Fatura')
      .select('*')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false });
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[PORTAL][FATURAS] Erro:', err);
    return NextResponse.json({ error: 'Erro ao buscar faturas.' }, { status: 500 });
  }
}
