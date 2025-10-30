import React from 'react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Agendamento {
  id: string;
  dataHora: string | Date;
  status: string;
  protocolCode: string; // <-- Adicionado
}

interface AppointmentCardProps {
  appointment: Agendamento;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  loading?: boolean;
}

export default function AgendamentoCard({
  appointment,
  onConfirm,
  onCancel,
  loading = false
}: AppointmentCardProps) {
  const isAppointmentPast = isPast(new Date(appointment.dataHora));
  const shouldHideStatusAndActions = isAppointmentPast && (appointment.status === 'PENDENTE' || appointment.status === 'CONFIRMADO');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDENTE':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'CANCELADO':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return 'success';
      case 'PENDENTE':
        return 'warning';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'default';
    }
  };

  const canConfirm = appointment.status === 'PENDENTE' && !isAppointmentPast;
  const canCancel = appointment.status !== 'CANCELADO' && !isAppointmentPast;

  return (
          <div className={cn(
            'bg-white rounded-xl border border-gray-200 p-4 sm:p-6 transition-all duration-200',
            isAppointmentPast && 'opacity-75',
            !isAppointmentPast && 'hover:shadow-lg hover:border-gray-300'
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {shouldHideStatusAndActions ? <Calendar className="h-5 w-5 text-gray-600" /> : getStatusIcon(appointment.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Consulta
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(appointment.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Protocolo: {appointment.protocolCode} {/* <-- Adicionado */}
                  </p>
                </div>
              </div>
              {!shouldHideStatusAndActions &&
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status}
                </Badge>
              }
            </div>
    
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {format(new Date(appointment.dataHora), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {format(new Date(appointment.dataHora), "HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>    
            {/* Actions */}
            {(canConfirm || canCancel) && (
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                {canConfirm && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={loading}
                    onClick={() => onConfirm?.(appointment.id)}
                    className="flex-1"
                  >
                    Confirmar
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={loading}
                    onClick={() => onCancel?.(appointment.id)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )}
      {isAppointmentPast && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {shouldHideStatusAndActions
              ? 'Aguardando atualização de status pelo administrador'
              : appointment.status === 'CANCELADO' ? 'Consulta cancelada' : appointment.status === 'REALIZADA' ? 'Consulta realizada' : appointment.status === 'CONFIRMADO' ? 'Consulta confirmada' : 'Consulta pendente de confirmação, favor confirmar'}
          </p>
        </div>
      )}
    </div>
  );
}