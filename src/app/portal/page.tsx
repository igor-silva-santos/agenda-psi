'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckSquare,
  LogOut,
  Home,
  Phone,
  Mail,
} from 'lucide-react';
import Link from 'next/link';;

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  value: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
}

export default function PatientPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Carregar dados do paciente
    loadPatientData();
  }, [session, status, router]);

  const loadPatientData = async () => {
    try {
      // Simular carregamento de dados
      // Em produção, fazer chamadas para APIs
      setAppointments([
        {
          id: '1',
          date: '2024-06-15',
          time: '14:00',
          status: 'scheduled',
          reason: 'Consulta de acompanhamento',
          value: 150
        },
        {
          id: '2',
          date: '2024-06-08',
          time: '15:00',
          status: 'completed',
          reason: 'Primeira consulta',
          value: 120
        }
      ]);

      setNotes([
        {
          id: '1',
          title: 'Primeira sessão - Avaliação inicial',
          content: 'Paciente demonstrou boa receptividade ao tratamento. Identificamos questões relacionadas à ansiedade no trabalho.',
          createdAt: '2024-06-08'
        }
      ]);

      setActivities([
        {
          id: '1',
          title: 'Exercício de respiração',
          description: 'Pratique a técnica 4-7-8 duas vezes ao dia',
          status: 'pending',
          dueDate: '2024-06-20'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPresence = async (appointmentId: string) => {
    try {
      // Implementar confirmação de presença
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'confirmed' as const }
            : apt
        )
      );
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return;
    
    try {
      // Implementar cancelamento
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em andamento';
      default: return status;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-emerald-600" />
                <span className="font-semibold text-gray-800">Dra. Jandira Frederick</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{session?.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo, {session?.user?.name ? session.user.name.split(" ")[0] : "Usuário"}!
          </h1>
          <p className="text-gray-600">
            Gerencie suas consultas e acompanhe seu progresso terapêutico
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                activeTab === 'appointments'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Meus Agendamentos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Anotações da Doutora</span>
            </button>
            
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                activeTab === 'activities'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckSquare className="h-5 w-5" />
              <span className="font-medium">Minhas Atividades</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Meus Agendamentos</h2>
                <Link
                  href="/"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Agendar Nova Consulta
                </Link>
              </div>
              
              {appointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                          <span className="font-medium">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-emerald-600" />
                          <span>{appointment.time}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{appointment.reason}</p>
                      <p className="text-sm text-gray-500">Valor: R$ {appointment.value.toFixed(2)}</p>
                    </div>
                    
                    {appointment.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleConfirmPresence(appointment.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Confirmar Presença
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Anotações da Doutora</h2>
              
              {notes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-800">{note.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{note.content}</p>
                </div>
              ))}
              
              {notes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma anotação disponível ainda</p>
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Minhas Atividades</h2>
              
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-800">{activity.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{activity.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Prazo: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                    
                    {activity.status === 'pending' && (
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                        Marcar como Concluída
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma atividade pendente</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-12 bg-emerald-50 rounded-lg p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Precisa de ajuda?</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-emerald-600" />
              <span className="text-gray-700">(11) 99999-9999</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-emerald-600" />
              <span className="text-gray-700">contato@drajandira.com.br</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

