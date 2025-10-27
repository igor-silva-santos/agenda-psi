'use client';

import { useEffect, useState, useRef } from 'react';
import { Agendamento } from '@prisma/client';
import { format, isToday, isThisWeek, isThisMonth, isFuture, isPast, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, AlertCircle, CheckCircle, Clock, XCircle, Search, Sun, List } from 'lucide-react';
//import AppointmentCalendar from '@/components/Agendamentos/AppointmentCalendar';
import AppointmentCard from '@/components/Agendamentos/AppointmentCard';
import AppointmentFilters from '@/components/Agendamentos/AppointmentFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AgendamentoFormMelhorado from '@/components/AgendamentoFormMelhorado';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function MeusAgendamentosPage() {
  const { data: session } = useSession();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isCancelConfirmationModalOpen, setIsCancelConfirmationModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<string | null>(null);
  const historicoRef = useRef<HTMLDivElement>(null);
  const proximasRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    if (status) {
      setStatusFilter(status);
    }
    if (date) {
      setDateFilter(date);
    }
  }, [searchParams]);

  const fetchAgendamentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portal/agendamentos');
      if (response.status === 401) {
        await signOut({ redirect: true, callbackUrl: '/auth/signin' });
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

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  useEffect(() => {
    if (!loading) { // Garante que o carregamento inicial terminou
      const scrollTo = searchParams.get('scrollTo');
      if (scrollTo === 'history') {
        console.log('Parâmetro scrollTo=history encontrado na URL após carregamento dos dados.');
        // Adiciona um pequeno atraso para garantir que o DOM foi atualizado
        setTimeout(() => {
          let elementToScroll: HTMLElement | null = null;
          if (scrollTo === 'history') {
            elementToScroll = historicoRef.current;
          } else if (scrollTo === 'proximas') {
            elementToScroll = proximasRef.current;
          }

          if (elementToScroll) {
            console.log(`Elemento "${scrollTo}" encontrado via ref. Tentando rolar...`);
            elementToScroll.scrollIntoView({ behavior: 'smooth' });
          } else {
            console.log(`Elemento "${scrollTo}" NÃO encontrado via ref após carregamento dos dados (após setTimeout).`);
          }
        }, 200); // Atraso de 200ms
      }
    }
  }, [loading, searchParams]); // Depende apenas de loading e searchParams

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  const handleCancelar = (id: string) => {
    setAppointmentToCancel(id);
    setIsCancelConfirmationModalOpen(true);
  };

  const handleConfirmarCancelamento = async () => {
    if (!appointmentToCancel) return;

    setActionLoading(appointmentToCancel);
    try {
      if (response.status === 403) {
        const data = await response.json();
        setError(data.error);
        return;
      }
      if (!response.ok) throw new Error('Erro ao cancelar agendamento');

      await fetchAgendamentos();
    } catch (err: any) {
      setError('Erro ao cancelar agendamento');
    } finally {
      setActionLoading(null);
      setIsCancelConfirmationModalOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const handleConfirmar = (id: string) => {
    setAppointmentToConfirm(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmarAgendamento = async () => {
    if (!appointmentToConfirm) return;

    setActionLoading(appointmentToConfirm);
    try {
      const response = await fetch(`/api/portal/agendamentos/${appointmentToConfirm}/confirmar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(session as any).accessToken}`,
        },
      });
      if (response.status === 401) {
        setError('Sessão expirada ou não autenticado. Faça login novamente.');
        return;
      }
      if (!response.ok) throw new Error('Erro ao confirmar agendamento');

      await fetchAgendamentos();
    } catch (err: any) {
      setError('Erro ao confirmar agendamento');
    } finally {
      setActionLoading(null);
      setIsConfirmationModalOpen(false);
      setAppointmentToConfirm(null);
    }
  };

  /*const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };*/

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
   // setSelectedDate(undefined);
  };

  const handleFilterChangeAndScroll = (newStatus: string, newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) {
      params.set('status', newStatus);
    }
    if (newDate) {
      params.set('date', newDate);
    } else {
      params.delete('date');
    }
    params.set('scrollTo', 'history'); // Sempre rolar para o histórico ao aplicar filtro

    router.push(`/portal/paciente/agendamentos?${params.toString()}`);
  };







  const proximasConsultas = agendamentos.filter(a => new Date(a.dataHora) >= new Date() && (a.status === 'PENDENTE' || a.status === 'CONFIRMADO' || a.status === 'PRE_AGENDADO'));
  const historicoConsultas = agendamentos.filter(appointment => {
    const appointmentDate = new Date(appointment.dataHora);
    const appointmentText = `${format(appointmentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })} ${appointment.status}`.toLowerCase();
    
    // Search filter
    if (searchTerm && !appointmentText.includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter && appointment.status !== statusFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter) {
      switch (dateFilter) {
        case 'today':
          if (!isToday(appointmentDate)) return false;
          break;
        case 'week':
          if (!isThisWeek(appointmentDate)) return false;
          break;
        case 'month':
          if (!isThisMonth(appointmentDate)) return false;
          break;
        case 'future':
          if (!isFuture(appointmentDate)) return false;
          break;
        case 'past':
          if (!isPast(appointmentDate)) return false;
          break;
      }
    }
    
    return true;
  });

  const statusMapping: {[key: string]: {icon: React.ElementType, color: string, text: string }} = {
    CONFIRMADO: { icon: CheckCircle, color: 'text-green-600', text: 'Cofinrmada'},
    PENDENTE: { icon: Clock, color: 'text-yellow-600', text: 'Pendente' },
    CANCELADO: { icon: XCircle, color: 'text-red-600', text: 'Cancelada'},
    REALIZADA: { icon: CheckCircle, color: 'text-blue-600', text: 'Realizada'},
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Carregando agendamentos..." />
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
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie suas consultas</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>


      {/* Filters */}
      {/*<AppointmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={handleClearFilters}
      />*/}

      <div className="grid grid-cols-1 gap-6">
        {/* Appointments List */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Próximas Consultas */}
                  <Card ref={proximasRef}>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Próximas Consultas</h2>
                      {/*<span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">*/}
                      <Badge variant="info">
                        {proximasConsultas.length} agendamento(s)
                      </Badge>
                    </div>
                    
                    {proximasConsultas.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proximasConsultas.map(appointment => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onConfirm={handleConfirmar}
                            onCancel={handleCancelar}
                            loading={actionLoading === appointment.id}
                            isPast={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consulta futura</h3>
                        <p className="text-gray-600 mb-4">Você não possui consultas agendadas para o futuro.</p>
                        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agendar Consulta
                        </Button>
                      </div>
                    )}
                  </Card>
        
                  {/* Histórico de Consultas */}
          <Card ref={historicoRef} className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Consultas</h2>
              {/*<span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">*/}
              <Badge variant="default">
                {historicoConsultas.length} consulta(s)
              </Badge>
            </div>

            {/* Filtros dentro do Card Historico */}
            <div className="pb-4 border-b border-gray-100">
              <AppointmentFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter} // Passa a função setStatusFilter
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter} // Passa a função setDateFilter
                onClearFilters={handleClearFilters}
                onFilterChangeAndScroll={handleFilterChangeAndScroll}
              />
            </div>

            {/* Legenda de Status */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
              <span className="font-semibold">Legenda:</span>
              {Object.keys(statusMapping).map(status => {
                const map = statusMapping[status];
                const IconComponent: React.ElementType = map.icon;
                return (
                  <div key={status} className="flex items-center gap-1">
                    <IconComponent className={`h-4 w-4 ${map.color}`} />
                    {map.text}
                  </div>
                );
              })}
            </div>
            
            {historicoConsultas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historicoConsultas.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    isPast={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum histórico</h3>
                <p className="text-gray-600">Ajuste os filtros ou aguarde a realização das próximas consultas.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[6px]" onClick={() => setIsModalOpen(false)}>
          <div 
            className="relative w-full h-full sm:h-auto sm:max-h-[95vh] bg-transparent rounded-none sm:rounded-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AgendamentoFormMelhorado onClose={() => {
              setIsModalOpen(false);
              fetchAgendamentos();
            }} />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isCancelConfirmationModalOpen}
        onClose={() => setIsCancelConfirmationModalOpen(false)}
        onConfirm={handleConfirmarCancelamento}
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja cancelar esta consulta?"
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmarAgendamento}
        title="Confirmar Agendamento"
        message="Tem certeza que deseja confirmar esta consulta?"
        confirmText="Confirmar"
        cancelText="Voltar"
      />
    </div>
  );
}
