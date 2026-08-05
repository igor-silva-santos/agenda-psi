import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const mesParam = searchParams.get('mes'); // YYYY-MM

  const hoje = new Date();
  let ref = hoje;
  if (mesParam && /^\d{4}-\d{2}$/.test(mesParam)) {
    const [ano, mes] = mesParam.split('-').map(Number);
    ref = new Date(ano, mes - 1, 1);
  }

  try {
    const inicioMes = startOfMonth(ref);
    const fimMes = endOfMonth(ref);

    const { data: ags, error: agsError } = await supabase
      .from('Agendamento')
      .select('id, dataHora, status, faturaId, patientId')
      .gte('dataHora', inicioMes.toISOString())
      .lte('dataHora', fimMes.toISOString());
    if (agsError) throw agsError;

    const totalAgendamentos = ags?.length ?? 0;
    const realizadas = ags?.filter(a => a.status === 'REALIZADO').length ?? 0;
    const canceladas = ags?.filter(a => a.status === 'CANCELADO').length ?? 0;
    const faltas = ags?.filter(a => a.status === 'NAO_COMPARECEU').length ?? 0;
    const confirmadas = ags?.filter(a => a.status === 'CONFIRMADO').length ?? 0;
    const pendentes = ags?.filter(a => a.status === 'PENDENTE').length ?? 0;

    const { data: faturasMes } = await supabase
      .from('Fatura')
      .select('id, status, valorTotal, createdAt')
      .gte('createdAt', inicioMes.toISOString())
      .lte('createdAt', fimMes.toISOString());

    const receitaRecebida = (faturasMes ?? []).filter(f => f.status === 'PAGO').reduce((s, f) => s + f.valorTotal, 0);
    const receitaPendente = (faturasMes ?? []).filter(f => f.status === 'PENDENTE').reduce((s, f) => s + f.valorTotal, 0);

    // Histórico de 6 meses para o gráfico
    const histMeses = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(ref, 5 - i);
      return {
        chave: format(d, 'yyyy-MM'),
        label: format(d, 'MMM/yy', { locale: ptBR }),
        inicio: startOfMonth(d),
        fim: endOfMonth(d),
      };
    });

    const { data: ags6 } = await supabase
      .from('Agendamento')
      .select('dataHora, status')
      .gte('dataHora', histMeses[0].inicio.toISOString())
      .lte('dataHora', histMeses[5].fim.toISOString());

    const { data: faturas6 } = await supabase
      .from('Fatura')
      .select('status, valorTotal, createdAt')
      .gte('createdAt', histMeses[0].inicio.toISOString())
      .lte('createdAt', histMeses[5].fim.toISOString());

    const historico6Meses = histMeses.map(({ chave, label, inicio, fim }) => {
      const agsDoMes = (ags6 ?? []).filter(a => new Date(a.dataHora) >= inicio && new Date(a.dataHora) <= fim);
      const faturasDoMes = (faturas6 ?? []).filter(f => new Date(f.createdAt) >= inicio && new Date(f.createdAt) <= fim);
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

    return NextResponse.json({
      mesChave: format(ref, 'yyyy-MM'),
      mesLabel: format(ref, "MMMM 'de' yyyy", { locale: ptBR }),
      totalAgendamentos, realizadas, canceladas, faltas, confirmadas, pendentes,
      receitaRecebida, receitaPendente,
      historico6Meses,
    });
  } catch (err: any) {
    console.error('[RELATORIOS-MENSAL] Erro:', err);
    return NextResponse.json({ error: 'Erro ao gerar relatório.', details: err.message }, { status: 500 });
  }
}
