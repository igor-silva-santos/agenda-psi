'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BarChart3, CalendarCheck, XCircle, UserX, DollarSign, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import KpiCard from '@/components/ui/KpiCard';
import Card from '@/components/ui/Card';
import ReportBarChart from '@/components/charts/ReportBarChart';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatorioMensal {
  mesChave: string;
  mesLabel: string;
  totalAgendamentos: number;
  realizadas: number;
  canceladas: number;
  faltas: number;
  confirmadas: number;
  pendentes: number;
  receitaRecebida: number;
  receitaPendente: number;
  historico6Meses: { mes: string; chave: string; recebido: number; pendente: number; total: number; realizadas: number; faltas: number; canceladas: number }[];
}

const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function RelatoriosPage() {
  const [ref, setRef] = useState(new Date());
  const [data, setData] = useState<RelatorioMensal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/relatorios/mensal?mes=${format(ref, 'yyyy-MM')}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [ref]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500 capitalize">{data?.mesLabel ?? '...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRef(subMonths(ref, 1))} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setRef(addMonths(ref, 1))} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link href="/admin/relatorios/anual" className="ml-2 text-sm font-medium text-blue-600 hover:underline">
            Ver relatório anual →
          </Link>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <KpiCard title="Agendamentos" value={String(data.totalAgendamentos)} icon={CalendarCheck} color="bg-blue-100 text-blue-600" />
            <KpiCard title="Realizadas" value={String(data.realizadas)} icon={CalendarCheck} color="bg-green-100 text-green-600" />
            <KpiCard title="Faltas" value={String(data.faltas)} icon={UserX} color="bg-red-100 text-red-600" />
            <KpiCard title="Canceladas" value={String(data.canceladas)} icon={XCircle} color="bg-orange-100 text-orange-600" />
            <KpiCard title="Receita recebida" value={formatBRL(data.receitaRecebida)} icon={DollarSign} color="bg-emerald-100 text-emerald-600" />
            <KpiCard title="Receita pendente" value={formatBRL(data.receitaPendente)} icon={Clock} color="bg-yellow-100 text-yellow-600" />
          </div>

          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Faturamento — últimos 6 meses</h2>
            <ReportBarChart
              data={data.historico6Meses}
              xKey="mes"
              compareKey="chave"
              highlightKey={data.mesChave}
              series={[
                { key: 'recebido', name: 'Recebido', color: '#10b981', formatValue: formatBRL },
                { key: 'pendente', name: 'Pendente', color: '#f59e0b', formatValue: formatBRL },
              ]}
              formatTotal={formatBRL}
            />
          </Card>

          <Card className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Consultas — últimos 6 meses</h2>
            <ReportBarChart
              data={data.historico6Meses}
              xKey="mes"
              compareKey="chave"
              highlightKey={data.mesChave}
              series={[
                { key: 'realizadas', name: 'Realizadas', color: '#3b82f6' },
                { key: 'faltas', name: 'Faltas', color: '#ef4444' },
                { key: 'canceladas', name: 'Canceladas', color: '#9ca3af' },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
