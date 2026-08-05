// GET /api/admin/auditoria — histórico de auditoria com filtros e paginação simples
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') ?? '50', 10)));
  const entidade = searchParams.get('entidade') ?? '';
  const acao = searchParams.get('acao') ?? '';
  const search = searchParams.get('q') ?? '';

  try {
    let query = supabase
      .from('AuditLog')
      .select('id, acao, entidade, entidadeId, descricao, autorId, autorNome, autorTipo, ip, createdAt', { count: 'exact' })
      .order('createdAt', { ascending: false });

    if (entidade) query = query.eq('entidade', entidade);
    if (acao) query = query.eq('acao', acao);
    if (search) query = query.ilike('descricao', `%${search}%`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return NextResponse.json({
      logs: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err) {
    console.error('[Auditoria] Erro ao buscar logs:', err);
    return NextResponse.json({ error: 'Erro ao buscar logs de auditoria.' }, { status: 500 });
  }
}
