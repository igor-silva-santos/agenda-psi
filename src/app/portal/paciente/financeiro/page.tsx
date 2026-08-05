'use client';

import { useEffect, useState } from 'react';
import { Loader2, DollarSign, Download, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Fatura {
  id: string;
  status: 'RASCUNHO' | 'PENDENTE' | 'PAGO' | 'CANCELADO';
  dataVencimento: string;
  valorTotal: number;
  quantidadeConsultas: number | null;
  createdAt: string;
}

const statusBadge: Record<Fatura['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  RASCUNHO: 'default',
  PENDENTE: 'warning',
  PAGO: 'success',
  CANCELADO: 'danger',
};

const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinanceiroPage() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/faturas')
      .then(res => res.json())
      .then(setFaturas)
      .finally(() => setLoading(false));
  }, []);

  const pendente = faturas.filter(f => f.status === 'PENDENTE').reduce((s, f) => s + f.valorTotal, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <DollarSign className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Financeiro</h1>
      </div>

      {pendente > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50/50" padding="sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800">
              Você tem <strong>{formatBRL(pendente)}</strong> em faturas pendentes.
            </p>
          </div>
        </Card>
      )}

      {faturas.length === 0 ? (
        <Card className="text-center py-12 text-gray-500">Você ainda não possui faturas.</Card>
      ) : (
        <div className="space-y-3">
          {faturas.map((f) => (
            <Card key={f.id} padding="sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusBadge[f.status]}>{f.status}</Badge>
                    <span className="text-xs text-gray-400">
                      Venc. {new Date(f.dataVencimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatBRL(f.valorTotal)}</p>
                  {f.quantidadeConsultas != null && (
                    <p className="text-xs text-gray-400">{f.quantidadeConsultas} consulta(s)</p>
                  )}
                </div>
                <a
                  href={`/api/faturas/${f.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4" /> Baixar PDF
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
