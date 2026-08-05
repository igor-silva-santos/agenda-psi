'use client';

import { useEffect, useState, useCallback } from 'react';
import { Receipt, Loader2, Plus, Download, CheckCircle, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import KpiCard from '@/components/ui/KpiCard';
import ModalGerarFatura from '@/components/Dashboard/ModalGerarFatura';
import { useToast } from '@/context/ToastContext';

interface Fatura {
  id: string;
  status: 'RASCUNHO' | 'PENDENTE' | 'PAGO' | 'CANCELADO';
  dataVencimento: string;
  valorTotal: number;
  quantidadeConsultas: number | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

const statusBadge: Record<Fatura['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  RASCUNHO: 'default',
  PENDENTE: 'warning',
  PAGO: 'success',
  CANCELADO: 'danger',
};

const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminFaturasPage() {
  const { addToast } = useToast();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('');
  const [modalAberto, setModalAberto] = useState(false);

  const fetchFaturas = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`/api/admin/faturas${params}`);
      if (res.ok) setFaturas(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaturas(filtro || undefined); }, [filtro, fetchFaturas]);

  const alterarStatus = async (id: string, status: Fatura['status']) => {
    const res = await fetch(`/api/admin/faturas/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      addToast('Status atualizado.', 'success');
      fetchFaturas(filtro || undefined);
    } else {
      addToast('Erro ao atualizar status.', 'error');
    }
  };

  const kpis = {
    pendente: faturas.filter(f => f.status === 'PENDENTE').reduce((s, f) => s + f.valorTotal, 0),
    pago: faturas.filter(f => f.status === 'PAGO').reduce((s, f) => s + f.valorTotal, 0),
    qtdPendente: faturas.filter(f => f.status === 'PENDENTE').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Receipt className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Faturas</h1>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Gerar Fatura
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard title="Pendente" value={formatBRL(kpis.pendente)} sub={`${kpis.qtdPendente} fatura(s)`} icon={Receipt} color="bg-yellow-100 text-yellow-600" />
        <KpiCard title="Recebido" value={formatBRL(kpis.pago)} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
        <KpiCard title="Total no filtro" value={String(faturas.length)} icon={Receipt} color="bg-blue-100 text-blue-600" />
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'PENDENTE', 'PAGO', 'CANCELADO', 'RASCUNHO'].map((s) => (
          <button
            key={s || 'todas'}
            onClick={() => setFiltro(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${filtro === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {s || 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : faturas.length === 0 ? (
        <Card className="text-center py-12 text-gray-500">Nenhuma fatura encontrada.</Card>
      ) : (
        <Card padding="sm" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="py-2 px-3">Paciente</th>
                <th className="py-2 px-3">Vencimento</th>
                <th className="py-2 px-3">Valor</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-800">{f.user?.name ?? '—'}</td>
                  <td className="py-2 px-3 text-gray-500">{new Date(f.dataVencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 px-3 text-gray-800 font-medium">{formatBRL(f.valorTotal)}</td>
                  <td className="py-2 px-3"><Badge variant={statusBadge[f.status]}>{f.status}</Badge></td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/api/faturas/${f.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Baixar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {f.status === 'PENDENTE' && (
                        <>
                          <button onClick={() => alterarStatus(f.id, 'PAGO')} className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50" title="Marcar como paga">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => alterarStatus(f.id, 'CANCELADO')} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Cancelar">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {modalAberto && (
        <ModalGerarFatura onClose={() => setModalAberto(false)} onGerada={() => fetchFaturas(filtro || undefined)} />
      )}
    </div>
  );
}
