'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, Edit, Trash2, Plus, Settings } from 'lucide-react';
import HorariosGestao from '@/components/HorariosGestao';

interface Agendamento {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  data: string;
  horario: string;
  motivo?: string;
  status: 'agendado' | 'confirmado' | 'cancelado';
  createdAt: string;
}

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filtroData, setFiltroData] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('agendamentos');

  // Simular autenticação simples
  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      loadAgendamentos();
    } else {
      alert('Senha incorreta');
    }
  };

  // Carregar agendamentos (simulado)
  const loadAgendamentos = () => {
    // Em produção, isso viria de uma API/banco de dados
    const mockAgendamentos: Agendamento[] = [
      {
        id: '1',
        nome: 'Maria Silva',
        telefone: '(11) 99999-1111',
        email: 'maria@email.com',
        data: '2024-06-10',
        horario: '09:00',
        motivo: 'Ansiedade',
        status: 'agendado',
        createdAt: '2024-06-09T10:00:00Z',
      },
      {
        id: '2',
        nome: 'João Santos',
        telefone: '(11) 99999-2222',
        data: '2024-06-10',
        horario: '15:00',
        motivo: 'Depressão',
        status: 'confirmado',
        createdAt: '2024-06-09T11:00:00Z',
      },
      {
        id: '3',
        nome: 'Ana Costa',
        telefone: '(11) 99999-3333',
        email: 'ana@email.com',
        data: '2024-06-11',
        horario: '10:00',
        status: 'agendado',
        createdAt: '2024-06-09T12:00:00Z',
      },
    ];
    setAgendamentos(mockAgendamentos);
  };

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const matchData = !filtroData || agendamento.data === filtroData;
    const matchStatus = filtroStatus === 'todos' || agendamento.status === filtroStatus;
    return matchData && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Área Administrativa</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navegação por Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agendamentos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Agendamentos
            </button>
            <button
              onClick={() => setActiveTab('horarios')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'horarios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Meus Horários
            </button>
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'agendamentos' && (
          <>
            {/* Filtros */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4">Filtros</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFiltroData('');
                      setFiltroStatus('todos');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total de Agendamentos</h3>
                <p className="text-2xl font-bold text-gray-800">{agendamentos.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Agendados</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {agendamentos.filter(a => a.status === 'agendado').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Confirmados</h3>
                <p className="text-2xl font-bold text-green-600">
                  {agendamentos.filter(a => a.status === 'confirmado').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Cancelados</h3>
                <p className="text-2xl font-bold text-red-600">
                  {agendamentos.filter(a => a.status === 'cancelado').length}
                </p>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Agendamentos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAgendamentos.map((agendamento) => (
                      <tr key={agendamento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {agendamento.nome}
                              </span>
                            </div>
                            {agendamento.motivo && (
                              <div className="text-sm text-gray-500 mt-1">
                                {agendamento.motivo}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {agendamento.telefone}
                            </div>
                            {agendamento.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                {agendamento.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              {agendamento.horario}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>
                            {getStatusText(agendamento.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'horarios' && <HorariosGestao />}
      </div>
    </div>
  );
}

