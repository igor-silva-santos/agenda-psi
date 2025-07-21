'use client';

import { useEffect, useState, Fragment } from 'react';
import { Agendamento, User } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User as UserIcon, CheckCircle2, AlertCircle, Hourglass, Trash2, Edit, MoreVertical, Search, Loader2 } from 'lucide-react';

// Tipagem para o agendamento com dados do paciente
interface AgendamentoComPaciente extends Agendamento {
  user: User;
}

// Componente para o chip de status
const StatusChip = ({ status }: { status: string }) => {
  const baseClasses = "text-xs font-medium px-2.5 py-1 rounded-full flex items-center justify-center";
  switch (status) {
    case 'CONFIRMADO':
      return <span className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle2 className="h-3 w-3 mr-1.5" />Confirmado</span>;
    case 'PENDENTE':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><Hourglass className="h-3 w-3 mr-1.5" />Pendente</span>;
    case 'CANCELADO':
      return <span className={`${baseClasses} bg-red-100 text-red-800`}><AlertCircle className="h-3 w-3 mr-1.5" />Cancelado</span>;
    case 'REALIZADO':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}><CheckCircle2 className="h-3 w-3 mr-1.5" />Realizado</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

export default function AdminAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRange, setFilterRange] = useState<string>('week'); // Padrão para esta semana
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterRange) params.append('range', filterRange);
      // A busca por nome/termo será feita no lado do cliente por simplicidade, mas poderia ser no backend

      const response = await fetch(`/api/admin/agendamentos?${params.toString()}`);
      if (!response.ok) throw new Error('Falha ao buscar agendamentos');
      
      const data = await response.json();
      const formattedData = data.map((item: any) => ({ ...item, user: item.paciente || item.user }));
      setAgendamentos(formattedData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, [filterStatus, filterRange]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Adicionar um modal de confirmação aqui seria o ideal
    if (!confirm(`Tem certeza que deseja mudar o status para ${newStatus}?`)) return;
    try {
      await fetch(`/api/admin/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAgendamentos(); // Atualiza a lista
    } catch (err: any) {
      alert(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este agendamento?')) return;
    try {
      await fetch(`/api/admin/agendamentos/${id}`, { method: 'DELETE' });
      fetchAgendamentos(); // Atualiza a lista
    } catch (err: any) {
      alert(`Erro ao deletar agendamento: ${err.message}`);
    }
  };

  const filteredAgendamentos = agendamentos.filter(ag => 
    ag.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Agendamentos</h1>
          <p className="text-md text-gray-600 mt-1">Visualize, filtre e gerencie todos os agendamentos.</p>
        </header>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          {/* Filtros e Barra de Busca */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Buscar por nome do paciente..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="flex gap-4">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full md:w-auto bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Todos Status</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="REALIZADO">Realizado</option>
                </select>
                <select
                    value={filterRange}
                    onChange={(e) => setFilterRange(e.target.value)}
                    className="w-full md:w-auto bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">Todos Períodos</option>
                    <option value="day">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                </select>
            </div>
          </div>

          {/* Tabela de Agendamentos */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data & Hora</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo da Consulta</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="text-center py-10 text-red-500">{error}</td></tr>
                ) : filteredAgendamentos.length > 0 ? (
                  filteredAgendamentos.map((agendamento) => (
                    <tr key={agendamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{agendamento.user.name}</div>
                            <div className="text-sm text-gray-500">{agendamento.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={agendamento.recomendacoes || ''}>
                        {agendamento.recomendacoes || <span className="italic text-gray-400">Não informado</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusChip status={agendamento.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          value={agendamento.status}
                          onChange={(e) => handleStatusChange(agendamento.id, e.target.value)}
                          className="mr-2 py-1 px-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="PENDENTE">Pendente</option>
                          <option value="CONFIRMADO">Confirmado</option>
                          <option value="CANCELADO">Cancelado</option>
                          <option value="REALIZADO">Realizado</option>
                        </select>
                        <button
                          onClick={() => handleDelete(agendamento.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100"
                          title="Deletar Agendamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-10">Nenhum agendamento encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}