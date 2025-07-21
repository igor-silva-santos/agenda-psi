'use client';

import { useEffect, useState } from 'react';
import { Agendamento } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export default function MinhasRecomendacoesPage() {
  const [agendamentos, setAgendamentos] = useState<Array<{ id: string; userId: number; dataHora: Date; status: string; motivoConsulta: string; recomendacao: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/portal/agendamentos');
        if (!response.ok) throw new Error('Falha ao buscar dados');
        const data = await response.json();
        // Buscar recomendações para cada agendamento
        const agendamentosComRecomendacoes = await Promise.all(
          data
            .filter((a: any) => new Date(a.dataHora) < new Date())
            .map(async (a: any) => {
              const recRes = await fetch(`/api/agendamentos/${a.id}/recomendacoes`);
              let recomendacao = '';
              if (recRes.ok) {
                const recData = await recRes.json();
                recomendacao = recData?.texto || '';
              }
              return { ...a, recomendacao };
            })
        );
        setAgendamentos(agendamentosComRecomendacoes.filter(a => a.recomendacao));
      } catch (err: any) {
        setError('Erro ao buscar');
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-800" data-testid="titulo-recomendacoes">Minhas Recomendações</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><span data-testid="loading">Carregando...</span></div>
      ) : error ? (
        <p className="text-red-500" data-testid="erro">{error}</p>
      ) : (
        agendamentos.length > 0 ? (
          <div className="space-y-6">
            {agendamentos.map(a => (
              <div key={a.id} className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-2 text-blue-700">Consulta de {format(new Date(a.dataHora), "dd/MM/yyyy", { locale: ptBR })}</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-base md:text-lg">{a.recomendacao}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center">
            <p className="text-gray-500" data-testid="vazio">Nenhuma recomendação encontrada.</p>
          </div>
        )
      )}
    </div>
  );
}
