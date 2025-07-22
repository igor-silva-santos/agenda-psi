'use client';

import { useEffect, useState } from 'react';
import { Agendamento } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export default function MeusAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendamentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portal/agendamentos');
      if (response.status === 401) {
        localStorage.setItem('sessaoExpirada', 'true');
        window.location.href = '/conta/login';
        return;
      }
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const data = await response.json();
      setAgendamentos(data);
    } catch (err: any) {
      setError('Erro ao buscar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const handleConfirmar = async (id: string) => {
    if (!confirm('Tem certeza que deseja confirmar esta consulta?')) return;
    const response = await fetch(`/api/portal/agendamentos/${id}/confirmar`, { method: 'PUT' });
    if (response.status === 401) {
      localStorage.setItem('sessaoExpirada', 'true');
      window.location.href = '/conta/login';
      return;
    }
    fetchAgendamentos(); // Re-fetch para atualizar a lista
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return;
    const response = await fetch(`/api/portal/agendamentos/${id}/cancelar`, { method: 'PUT' });
    if (response.status === 401) {
      localStorage.setItem('sessaoExpirada', 'true');
      window.location.href = '/conta/login';
      return;
    }
    fetchAgendamentos(); // Re-fetch para atualizar a lista
  };

  const proximasConsultas = agendamentos.filter(a => new Date(a.dataHora) >= new Date());
  const historicoConsultas = agendamentos.filter(a => new Date(a.dataHora) < new Date());

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-800" data-testid="titulo-agendamentos">Meus Agendamentos</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><span data-testid="loading">Carregando...</span></div>
      ) : error ? (
        <p className="text-red-500" data-testid="erro">{error}</p>
      ) : (
        <>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700" data-testid="titulo-proximas">Próximas Consultas</h2>
            <div className="space-y-4">
              {proximasConsultas.length > 0 ? proximasConsultas.map(a => (
                <div key={a.id} className="border p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between bg-blue-50/30">
                  <div>
                    <p className="text-base md:text-lg"><strong>Data:</strong> {format(new Date(a.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    <p className="text-base md:text-lg"><strong>Status:</strong> {a.status}</p>
                  </div>
                  <div className="mt-3 md:mt-0 flex gap-2">
                    {a.status === 'PRE_AGENDADO' && <button onClick={() => handleConfirmar(a.id)} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-all">{loading ? 'Confirmando...' : 'Confirmar'}</button>}
                    {a.status !== 'CANCELADO' && <button onClick={() => handleCancelar(a.id)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition-all">{loading ? 'Cancelando...' : 'Cancelar'}</button>}
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center" data-testid="vazio-proximas">Nenhuma consulta futura encontrada.</p>}
            </div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700" data-testid="titulo-historico">Histórico de Consultas</h2>
            <div className="space-y-4">
              {historicoConsultas.length > 0 ? historicoConsultas.map(a => (
                <div key={a.id} className="border p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base md:text-lg"><strong>Data:</strong> {format(new Date(a.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    <p className="text-base md:text-lg"><strong>Status:</strong> {a.status}</p>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center" data-testid="vazio-historico">Nenhum histórico de consultas encontrado.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
