'use client';

import { useEffect, useState } from 'react';
import { Agendamento } from '@prisma/client';
import { format, isToday, isThisWeek, isThisMonth, isFuture, isPast, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, AlertCircle, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import AppointmentCalendar from '@/components/Agendamentos/AppointmentCalendar';
import AppointmentCard from '@/components/Agendamentos/AppointmentCard';
import AppointmentFilters from '@/components/Agendamentos/AppointmentFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function MeusAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const handleConfirmar = async (id: string) => {
    if (!confirm('Tem certeza que deseja confirmar esta consulta?')) return;
    
    setActionLoading(id);
    try {
      const response = await fetch(`/api/portal/agendamentos/${id}/confirmar`, { method: 'PUT' });
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
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return;
    
    setActionLoading(id);
    try {
      const response = await fetch(`/api/portal/agendamentos/${id}/cancelar`, { method: 'PUT' });
      if (response.status === 401) {
        setError('Sessão expirada ou não autenticado. Faça login novamente.');
        return;
      }
      if (!response.ok) throw new Error('Erro ao cancelar agendamento');
      
      await fetchAgendamentos();
    } catch (err: any) {
      setError('Erro ao cancelar agendamento');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    setSelectedDate(undefined);
  };

  // Filter appointments based on search, status, and date filters
  const filteredAgendamentos = agendamentos.filter(appointment => {
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
    
    // Selected date filter
    if (selectedDate && !isToday(appointmentDate) && !isToday(selectedDate)) {
      const appointmentDay = startOfDay(appointmentDate);
      const selectedDay = startOfDay(selectedDate);
      if (appointmentDay.getTime() !== selectedDay.getTime()) {
        return false;
      }
    }
    
    return true;
  });

  const proximasConsultas = filteredAgendamentos.filter(a => new Date(a.dataHora) >= new Date());
  const historicoConsultas = filteredAgendamentos.filter(a => new Date(a.dataHora) < new Date());

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
          <p className="text-gray-600 mt-1">Gerencie suas consultas e compromissos</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AppointmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={handleClearFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <AppointmentCalendar
            appointments={agendamentos}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Próximas Consultas */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Próximas Consultas</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {proximasConsultas.length}
              </span>
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
              <Card className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consulta futura</h3>
                <p className="text-gray-600 mb-4">Você não possui consultas agendadas para o futuro.</p>
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </Card>
            )}
          </div>

          {/* Histórico de Consultas */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Consultas</h2>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {historicoConsultas.length}
              </span>
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
              <Card className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum histórico</h3>
                <p className="text-gray-600">Você ainda não possui consultas realizadas.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredAgendamentos.length === 0 && agendamentos.length > 0 && (
        <Card className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar os filtros para encontrar seus agendamentos.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        </Card>
      )}
    </div>
  );
}
