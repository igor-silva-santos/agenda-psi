import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Appointment {
  id: string;
  dataHora: string | Date;
  status: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  loading?: boolean;
  isPast?: boolean;
}

export default function AppointmentCard({ 
  appointment, 
  onConfirm, 
  onCancel, 
  loading = false,
  isPast = false 
}: AppointmentCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDENTE':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'CANCELADO':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PRE_AGENDADO':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
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
      case 'PRE_AGENDADO':
        return 'info';
      default:
        return 'default';
    }
  };

  const canConfirm = appointment.status === 'PRE_AGENDADO' && !isPast;
  const canCancel = appointment.status !== 'CANCELADO' && !isPast;

  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200',
      isPast && 'opacity-75',
      !isPast && 'hover:shadow-lg hover:border-gray-300'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(appointment.status)}
          <div>
            <h3 className="font-semibold text-gray-900">
              Consulta
            </h3>
            <p className="text-sm text-gray-600">
              {format(new Date(appointment.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <Badge variant={getStatusVariant(appointment.status)}>
          {appointment.status}
        </Badge>
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
      {!isPast && (canConfirm || canCancel) && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
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

      {isPast && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Consulta realizada
          </p>
        </div>
      )}
    </div>
  );
} 