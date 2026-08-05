'use client';

import { useEffect, useState, useCallback } from 'react';
import { ScrollText, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface LogEntry {
  id: string;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  descricao: string;
  autorNome: string | null;
  autorTipo: string | null;
  createdAt: string;
}

const acaoColor: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  CRIAR: 'success',
  ATUALIZAR: 'info',
  DELETAR: 'danger',
  CANCELAR: 'warning',
  PAGAR: 'success',
  ENVIAR: 'info',
  ASSINAR: 'success',
  CONFIRMAR: 'success',
  SISTEMA: 'default',
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '30' });
      if (q) params.set('q', q);
      const res = await fetch(`/api/admin/auditoria?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1, search);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-100 rounded-full">
          <ScrollText className="h-6 w-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
          <p className="text-sm text-gray-500">Histórico de ações realizadas no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar na descrição..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Buscar
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="text-center py-12 text-gray-500">Nenhum registro de auditoria encontrado.</Card>
      ) : (
        <Card padding="sm" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="py-2 px-3">Quando</th>
                <th className="py-2 px-3">Ação</th>
                <th className="py-2 px-3">Entidade</th>
                <th className="py-2 px-3">Descrição</th>
                <th className="py-2 px-3">Autor</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 whitespace-nowrap text-gray-500">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={acaoColor[log.acao] ?? 'default'}>{log.acao}</Badge>
                  </td>
                  <td className="py-2 px-3 text-gray-700">{log.entidade}</td>
                  <td className="py-2 px-3 text-gray-700 max-w-md">{log.descricao}</td>
                  <td className="py-2 px-3 text-gray-500">{log.autorNome ?? log.autorTipo ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
