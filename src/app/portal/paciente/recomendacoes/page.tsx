'use client';

import { useEffect, useState, useMemo } from 'react';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import RecommendationCard from '@/components/Recomendacoes/RecommendationCard';
import RecommendationFilters from '@/components/Recomendacoes/RecommendationFilters';
import RecommendationStats from '@/components/Recomendacoes/RecommendationStats';

interface Recommendation {
  id: string;
  userId: number;
  dataHora: Date | string;
  status: string;
  motivoConsulta: string;
  recomendacao: string;
}

export default function MinhasRecomendacoesPage() {
  const [agendamentos, setAgendamentos] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchAgendamentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/portal/agendamentos');
        if (response.status === 401) {
          setError('Sessão expirada ou não autenticado. Faça login novamente.');
          setLoading(false);
          return;
        }
        if (!response.ok) throw new Error('Falha ao buscar dados');
        const data = await response.json();
        
        // Buscar recomendações para cada agendamento
        const agendamentosComRecomendacoes = await Promise.all(
          data
            .filter((a: any) => new Date(a.dataHora) < new Date())
            .map(async (a: any) => {
              const recRes = await fetch(`/api/agendamentos/${a.id}/recomendacoes`);
              if (recRes.status === 401) {
                setError('Sessão expirada ou não autenticado. Faça login novamente.');
                return null;
              }
              let recomendacao = '';
              if (recRes.ok) {
                const recData = await recRes.json();
                recomendacao = recData?.texto || '';
              }
              return { ...a, recomendacao };
            })
        );
        
        const filteredAgendamentos = agendamentosComRecomendacoes
          .filter(a => a && a.recomendacao) as Recommendation[];
        setAgendamentos(filteredAgendamentos);
      } catch (err: any) {
        setError('Erro ao buscar recomendações');
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, []);

  // Filtrar recomendações
  const filteredRecommendations = useMemo(() => {
    let filtered = agendamentos;

    // Filtro por data
    if (dateFilter) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case 'last-30':
          startDate = subDays(now, 30);
          break;
        case 'last-90':
          startDate = subDays(now, 90);
          break;
        case 'last-6-months':
          startDate = subDays(now, 180);
          break;
        case 'last-year':
          startDate = subDays(now, 365);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.dataHora);
        return isAfter(recDate, startDate) && isBefore(recDate, now);
      });
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(rec =>
        rec.recomendacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.motivoConsulta.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [agendamentos, searchTerm, dateFilter]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    
    const recentRecommendations = agendamentos.filter(rec => 
      new Date(rec.dataHora) > thirtyDaysAgo
    ).length;
    
    const averageLength = agendamentos.length > 0 
      ? Math.round(agendamentos.reduce((sum, rec) => sum + rec.recomendacao.length, 0) / agendamentos.length)
      : 0;
    
    const lastRecommendation = agendamentos.length > 0 
      ? agendamentos.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())[0].dataHora
      : undefined;

    return {
      totalRecommendations: agendamentos.length,
      recentRecommendations,
      averageLength,
      lastRecommendation
    };
  }, [agendamentos]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Carregando recomendações...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Minhas Recomendações
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Acompanhe as recomendações da Dra. Jandira Frederick
        </p>
      </div>

      {/* Stats */}
      {agendamentos.length > 0 && (
        <RecommendationStats
          totalRecommendations={stats.totalRecommendations}
          recentRecommendations={stats.recentRecommendations}
          averageLength={stats.averageLength}
          lastRecommendation={stats.lastRecommendation}
        />
      )}

      {/* Filters */}
      <RecommendationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {/* Content */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-6">
          {filteredRecommendations.map((agendamento) => (
            <RecommendationCard
              key={agendamento.id}
              id={agendamento.id}
              dataHora={agendamento.dataHora}
              recomendacao={agendamento.recomendacao}
              status={agendamento.status}
              motivoConsulta={agendamento.motivoConsulta}
            />
          ))}
        </div>
      ) : agendamentos.length > 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhuma recomendação encontrada
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros de busca ou data para encontrar suas recomendações.
          </p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhuma recomendação disponível
          </h3>
          <p className="text-gray-500">
            Você ainda não possui recomendações da Dra. Jandira Frederick.
            As recomendações aparecerão aqui após suas consultas.
          </p>
        </div>
      )}
    </div>
  );
}
