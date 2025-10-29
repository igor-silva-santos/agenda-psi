'use client';

import { useEffect, useState, useRef } from 'react';
import { Agendamento } from '@prisma/client';
import { format, isToday, isThisWeek, isThisMonth, isFuture, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import AppointmentCard from '@/components/Agendamentos/AppointmentCard';
import AppointmentFilters from '@/components/Agendamentos/AppointmentFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AgendamentoFormMelhorado from '@/components/AgendamentoFormMelhorado';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Modal from '@/components/Modal'; // Using the state-based modal component

export default function MeusAgendamentosPage() {
  const { addToast } = useToast();
  const { data: session } = useSession();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isCancelConfirmationModalOpen, setIsCancelConfirmationModalOpen] = useState(false);
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<string | null>(null);
  const historicoRef = useRef<HTMLDivElement>(null);
  const proximasRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleAgendamentoSuccess = (message: string) => {
    addToast(message, 'info');
    setTimeout(() => {
      closeAgendamentoModal();
      fetchAgendamentos();
    }, 100);
  };

  const onFilterChangeAndScroll = (newStatus: string, newDate: string) => {
    setStatusFilter(newStatus);
    setDateFilter(newDate);
    if (newDate === 'past' || newDate === 'history') {
      setTimeout(() => {
        historicoRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const closeAgendamentoModal = () => {
    setIsAgendamentoModalOpen(false);
    router.push('/portal/paciente/agendamentos', { scroll: false });
  };

  const openAgendamentoModal = () => {
    setIsAgendamentoModalOpen(true);
  };

  useEffect(() => {
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const scrollTo = searchParams.get('scrollTo');

    if (status) {
      setStatusFilter(status);
    }
    if (date) {
      setDateFilter(date);
    }

    if (searchParams.get('agendar') === 'true') {
      openAgendamentoModal();
    }

    if (scrollTo === 'history' && !loading) {
      setTimeout(() => {
        historicoRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams, loading]);

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

  const handleCancelar = (id: string) => {
    setAppointmentToCancel(id);
    setIsCancelConfirmationModalOpen(true);
  };

  const handleConfirmarCancelamento = async () => {
    if (!appointmentToCancel) return;

    setActionLoading(appointmentToCancel);
    try {
      const response = await fetch(`/api/portal/agendamentos/${appointmentToCancel}/cancelar`, {
        method: 'PUT',
      });

      if (!response.ok) {
        if (response.status === 403) {
          setIsCancelConfirmationModalOpen(false);
          setIsWhatsappModalOpen(true);
          return; // Mantém appointmentToCancel para o modal do WhatsApp
        }
        throw new Error('Erro ao cancelar agendamento');
      }

      addToast('Consulta cancelada com sucesso!', 'success');
      await fetchAgendamentos();
      
      // Sucesso: fecha o modal e limpa o estado
      setIsCancelConfirmationModalOpen(false);
      setAppointmentToCancel(null);

    } catch (err: any) {
      setError('Erro ao cancelar agendamento');
      // Erro: fecha o modal e limpa o estado
      setIsCancelConfirmationModalOpen(false);
      setAppointmentToCancel(null);
    } finally {
      setActionLoading(null);
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
        setIsConfirmationModalOpen(false);
        setAppointmentToConfirm(null);
        return;
      }
      if (!response.ok) throw new Error('Erro ao confirmar agendamento');

      addToast('Consulta confirmada com sucesso!', 'success');
      setTimeout(async () => {
        await fetchAgendamentos();
        setIsConfirmationModalOpen(false);
        setAppointmentToConfirm(null);
      }, 100);
    } catch (err: any) {
      setError('Erro ao confirmar agendamento');
      setIsConfirmationModalOpen(false);
      setAppointmentToConfirm(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  };

  const proximasConsultas = agendamentos.filter(a => new Date(a.dataHora) >= new Date() && (a.status === 'PENDENTE' || a.status === 'CONFIRMADO' || a.status === 'PRE_AGENDADO'));
  const historicoConsultas = agendamentos.filter(appointment => {
    const appointmentDate = new Date(appointment.dataHora);
    const appointmentText = `${format(appointmentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })} ${appointment.status}`.toLowerCase();
    
    if (searchTerm && !appointmentText.includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (statusFilter && appointment.status !== statusFilter) {
      return false;
    }
    
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
    CONFIRMADO: { icon: CheckCircle, color: 'text-green-600', text: 'Confirmada'},
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

  const appointmentForWhatsapp = agendamentos.find(a => a.id === appointmentToCancel);
  const patientName = session?.user?.name || 'Paciente';
  const appointmentDate = appointmentForWhatsapp ? format(new Date(appointmentForWhatsapp.dataHora), 'dd/MM/yyyy') : '';
  const appointmentTime = appointmentForWhatsapp ? format(new Date(appointmentForWhatsapp.dataHora), 'HH:mm') : '';
  const message = `Gostaria de cancelar a consulta do dia ${appointmentDate} às ${appointmentTime} em nome de ${patientName}.`;
  const whatsappUrl = `https://wa.me/5511949197669?text=${encodeURIComponent(message)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie suas consultas</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" className="flex items-center gap-2" onClick={openAgendamentoModal}>
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card ref={proximasRef}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Próximas Consultas</h2>
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consulta futura</h3>
              <p className="text-gray-600 mb-4">Você não possui consultas agendadas para o futuro.</p>
              <Button variant="primary" onClick={openAgendamentoModal}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Consulta
              </Button>
            </div>
          )}
        </Card>

        <Card ref={historicoRef} className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Consultas</h2>
            <Badge variant="default">
              {historicoConsultas.length} consulta(s)
            </Badge>
          </div>

          <div className="pb-4 border-b border-gray-100">
            <AppointmentFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              onClearFilters={handleClearFilters}
              onFilterChangeAndScroll={onFilterChangeAndScroll}
            />
          </div>

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

      {/* Modals */}
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

      <Modal
        isOpen={isAgendamentoModalOpen}
        onClose={closeAgendamentoModal}
        title="Novo Agendamento"
      >
        <AgendamentoFormMelhorado 
          onSuccess={handleAgendamentoSuccess}
          onClose={closeAgendamentoModal} 
        />
      </Modal>

      {appointmentForWhatsapp && (
        <Modal
          isOpen={isWhatsappModalOpen}
          onClose={() => {
            setIsWhatsappModalOpen(false);
            setAppointmentToCancel(null);
          }}
          title="Cancelamento fora do prazo"
        >
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              Não é possível cancelar a consulta com menos de 24 horas de antecedência.
              <br />
              Por favor, entre em contato com a Jandira para solicitar o cancelamento.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Entrar em contato via WhatsApp
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}