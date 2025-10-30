'use client';

import { useEffect, useState } from 'react';
import { Agendamento } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowRight, Plus, FileText, User } from 'lucide-react';
import DashboardCard from '@/components/Dashboard/DashboardCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PacienteDashboard() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setAgendamentos(data);
      } catch (err: any) {
        setError('Erro ao buscar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, []);

  const proximaConsulta = (agendamentos || [])
    .filter(a => new Date(a.dataHora) > new Date() && (a.status === 'CONFIRMADO' || a.status === 'PENDENTE' || a.status === 'PRE_AGENDADO'))
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())[0];

  const agendamentosConfirmados = (agendamentos || []).filter(a => a.status === 'CONFIRMADO').length;
  const agendamentosPendentes = (agendamentos || []).filter(a => a.status === 'PENDENTE').length;
  const agendamentosCancelados = (agendamentos || []).filter(a => a.status === 'CANCELADO').length;
  const agendamentosRealizadas = (agendamentos || []).filter(a => a.status === 'REALIZADA').length;



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Início</h1>
          <p className="text-gray-600 mt-1">Bem-vindo a Clinica Flowers</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/portal/paciente/agendamentos?agendar=true"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Link>
        </div>
      </div>

                  {/* Stats Cards */}
                  <div className="flex justify-center"> {/* Contêiner para centralizar o grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center">
                      <DashboardCard
                        title="Consultas Realizadas"
                        value={agendamentosRealizadas}
                        icon={CheckCircle}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                      />
                      <DashboardCard
                        title="Consultas Confirmadas"
                        value={agendamentosConfirmados}
                        icon={CheckCircle}
                        trend={{ value: 12, isPositive: true }}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                      />
                      <DashboardCard
                        title="Consultas Pendentes"
                        value={agendamentosPendentes}
                        icon={Clock}
                        trend={{ value: 5, isPositive: false }}
                        iconBgColor="bg-yellow-100"
                        iconColor="text-yellow-600"
                      />
                      <DashboardCard
                        title="Consultas Canceladas"
                        value={agendamentosCancelados}
                        icon={AlertCircle}
                        iconBgColor="bg-red-100"
                        iconColor="text-red-600"
                      />
                      <DashboardCard
                        title="Total de Consultas"
                        value={agendamentos.length}
                        icon={Calendar}
                        iconBgColor="bg-gray-100"
                        iconColor="text-gray-600"
                      />
                    </div>
                  </div>
            
      {/* Próxima Consulta */}
      <div> {/* Adicionado um div para envolver o card */}
        {proximaConsulta ? (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex flex-wrap items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Próxima Consulta</h2>
                  <Badge
                    variant={proximaConsulta.status === 'CONFIRMADO' ? 'success' : proximaConsulta.status === 'PENDENTE' ? 'warning' : 'default'}
                  >
                    {proximaConsulta.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {format(new Date(proximaConsulta.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {format(new Date(proximaConsulta.dataHora), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <Link 
                href="/portal/paciente/agendamentos"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4 sm:mt-0"
              >
                Ver detalhes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consulta agendada</h3>
            <p className="text-gray-600 mb-4">Agende sua primeira consulta para começar</p>
            <Link 
              href="/portal/paciente/agendamentos"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agendar Consulta
            </Link>
          </Card>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/portal/paciente/agendamentos">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Meus Agendamentos</h3>
                <p className="text-sm text-gray-600">Visualize e gerencie suas consultas</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/portal/paciente/recomendacoes">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Minhas Recomendações</h3>
                <p className="text-sm text-gray-600">Acesse suas recomendações</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/portal/paciente/perfil">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Meu Perfil</h3>
                <p className="text-sm text-gray-600">Atualize suas informações pessoais</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      {agendamentos.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {agendamentos.slice(0, 3).map((agendamento) => (
              <div key={agendamento.id} className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      Consulta em {format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Status: <Badge 
                        variant={agendamento.status === 'CONFIRMADO' ? 'success' : agendamento.status === 'PENDENTE' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {agendamento.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <Link 
                  href={`/portal/paciente/agendamentos`}
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium mt-2 sm:mt-0"
                >
                  Ver detalhes
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
