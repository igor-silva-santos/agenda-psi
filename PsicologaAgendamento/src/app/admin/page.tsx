'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Edit, Trash2, Settings } from 'lucide-react';
import GestaoCalendario from '@/components/GestaoCalendario'; // ALTERAÇÃO: Importando o novo componente

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

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      loadAgendamentos();
    } else {
      alert('Senha incorreta');
    }
  };

  const loadAgendamentos = () => {
    const mockAgendamentos: Agendamento[] = [
      { id: '1', nome: 'Maria Silva', telefone: '(11) 99999-1111', email: 'maria@email.com', data: '2024-06-10', horario: '09:00', motivo: 'Ansiedade', status: 'agendado', createdAt: '2024-06-09T10:00:00Z' },
      { id: '2', nome: 'João Santos', telefone: '(11) 99999-2222', data: '2024-06-10', horario: '15:00', motivo: 'Depressão', status: 'confirmado', createdAt: '2024-06-09T11:00:00Z' },
      { id: '3', nome: 'Ana Costa', telefone: '(11) 99999-3333', email: 'ana@email.com', data: '2024-06-11', horario: '10:00', status: 'agendado', createdAt: '2024-06-09T12:00:00Z' },
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
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Área Administrativa</h1>
          <div className="space-y-6">
            <input 
              type="password" 
              placeholder="Senha de acesso" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500" 
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
            />
            <button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md"
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <button onClick={() => setIsAuthenticated(false)} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Sair</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('agendamentos')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'agendamentos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Calendar className="h-5 w-5 inline mr-2" />Agendamentos
              </button>
              <button onClick={() => setActiveTab('horarios')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'horarios' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Settings className="h-5 w-5 inline mr-2" />Meus Horários
              </button>
            </nav>
          </div>
        </div>
        {activeTab === 'agendamentos' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Filtros</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por data</label>
                  <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por status</label>
                  <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                    <option value="todos">Todos</option>
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { setFiltroData(''); setFiltroStatus('todos'); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">Limpar Filtros</button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm"><h3 className="text-sm font-medium text-gray-500">Total de Agendamentos</h3><p className="text-3xl font-bold text-gray-800 mt-1">{agendamentos.length}</p></div>
              <div className="bg-white p-6 rounded-lg shadow-sm"><h3 className="text-sm font-medium text-gray-500">Agendados</h3><p className="text-3xl font-bold text-yellow-500 mt-1">{agendamentos.filter(a => a.status === 'agendado').length}</p></div>
              <div className="bg-white p-6 rounded-lg shadow-sm"><h3 className="text-sm font-medium text-gray-500">Confirmados</h3><p className="text-3xl font-bold text-green-500 mt-1">{agendamentos.filter(a => a.status === 'confirmado').length}</p></div>
              <div className="bg-white p-6 rounded-lg shadow-sm"><h3 className="text-sm font-medium text-gray-500">Cancelados</h3><p className="text-3xl font-bold text-red-500 mt-1">{agendamentos.filter(a => a.status === 'cancelado').length}</p></div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b"><h2 className="text-xl font-semibold text-gray-800">Lista de Agendamentos</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAgendamentos.map((agendamento) => (
                      <tr key={agendamento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><User className="h-4 w-4 text-gray-400 mr-3" /><div className="text-sm"><div className="font-medium text-gray-900">{agendamento.nome}</div>{agendamento.motivo && (<div className="text-gray-500 mt-1">{agendamento.motivo}</div>)}</div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm"><div className="flex items-center text-gray-900"><Phone className="h-4 w-4 text-gray-400 mr-2" />{agendamento.telefone}</div>{agendamento.email && (<div className="flex items-center text-gray-500 mt-1"><Mail className="h-4 w-4 text-gray-400 mr-2" />{agendamento.email}</div>)}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm"><div className="flex items-center text-gray-900"><Calendar className="h-4 w-4 text-gray-400 mr-2" />{new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div><div className="flex items-center text-gray-500 mt-1"><Clock className="h-4 w-4 text-gray-400 mr-2" />{agendamento.horario}</div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>{getStatusText(agendamento.status)}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex space-x-3"><button className="text-blue-600 hover:text-blue-800 transition-colors"><Edit className="h-5 w-5" /></button><button className="text-red-600 hover:text-red-800 transition-colors"><Trash2 className="h-5 w-5" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* ALTERAÇÃO: Renderizando o novo componente GestaoCalendario */}
        {activeTab === 'horarios' && <GestaoCalendario />}
      </main>
    </div>
  );
}