import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/faturas?status=PENDENTE — lista faturas com dados do paciente
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = supabase
      .from('Fatura')
      .select('*, user:User(id, name, email, cpf)')
      .order('createdAt', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[FATURAS][GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao buscar faturas.' }, { status: 500 });
  }
}
