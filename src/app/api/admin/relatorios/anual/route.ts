import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const anoParam = searchParams.get('ano');
  const ano = anoParam && /^\d{4}$/.test(anoParam) ? Number(anoParam) : new Date().getFullYear();

  try {
    const inicioAno = startOfYear(new Date(ano, 0, 1));
    const fimAno = endOfYear(new Date(ano, 0, 1));

    const { data: ags, error: agsError } = await supabase
      .from('Agendamento')
      .select('dataHora, status')
      .gte('dataHora', inicioAno.toISOString())
      .lte('dataHora', fimAno.toISOString());
    if (agsError) throw agsError;

    const { data: faturas } = await supabase
      .from('Fatura')
      .select('status, valorTotal, createdAt')
      .gte('createdAt', inicioAno.toISOString())
      .lte('createdAt', fimAno.toISOString());

    const meses = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(ano, i, 1);
      return { chave: format(d, 'yyyy-MM'), label: format(d, 'MMM', { locale: ptBR }), inicio: startOfMonth(d), fim: endOfMonth(d) };
    });

    const porMes = meses.map(({ chave, label, inicio, fim }) => {
      const agsDoMes = (ags ?? []).filter(a => new Date(a.dataHora) >= inicio && new Date(a.dataHora) <= fim);
      const faturasDoMes = (faturas ?? []).filter(f => new Date(f.createdAt) >= inicio && new Date(f.createdAt) <= fim);
      const recebido = faturasDoMes.filter(f => f.status === 'PAGO').reduce((s, f) => s + f.valorTotal, 0);
      const pendente = faturasDoMes.filter(f => f.status === 'PENDENTE').reduce((s, f) => s + f.valorTotal, 0);
      return {
        mes: label,
        chave,
        recebido,
        pendente,
        total: agsDoMes.length,
        realizadas: agsDoMes.filter(a => a.status === 'REALIZADO').length,
        faltas: agsDoMes.filter(a => a.status === 'NAO_COMPARECEU').length,
        canceladas: agsDoMes.filter(a => a.status === 'CANCELADO').length,
      };
    });

    const totalAno = {
      agendamentos: ags?.length ?? 0,
      realizadas: ags?.filter(a => a.status === 'REALIZADO').length ?? 0,
      canceladas: ags?.filter(a => a.status === 'CANCELADO').length ?? 0,
      faltas: ags?.filter(a => a.status === 'NAO_COMPARECEU').length ?? 0,
      receitaRecebida: (faturas ?? []).filter(f => f.status === 'PAGO').reduce((s, f) => s + f.valorTotal, 0),
      receitaPendente: (faturas ?? []).filter(f => f.status === 'PENDENTE').reduce((s, f) => s + f.valorTotal, 0),
    };

    return NextResponse.json({ ano, porMes, totalAno });
  } catch (err: any) {
    console.error('[RELATORIOS-ANUAL] Erro:', err);
    return NextResponse.json({ error: 'Erro ao gerar relatório.', details: err.message }, { status: 500 });
  }
}
