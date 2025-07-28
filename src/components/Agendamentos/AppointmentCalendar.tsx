import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  dataHora: string;
  status: 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'PRE_AGENDADO';
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export default function AppointmentCalendar({ appointments, onDateSelect, selectedDate }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.dataHora), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return 'bg-green-500';
      case 'PENDENTE':
        return 'bg-yellow-500';
      case 'CANCELADO':
        return 'bg-red-500';
      case 'PRE_AGENDADO':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map(day => {
          const dayAppointments = getAppointmentsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                'p-2 text-sm rounded-lg transition-all duration-200 relative min-h-[60px] flex flex-col items-center justify-center',
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                isToday(day) && 'bg-blue-100 font-semibold',
                isSelected && 'bg-blue-600 text-white',
                !isSelected && isCurrentMonth && 'hover:bg-gray-100',
                dayAppointments.length > 0 && !isSelected && 'bg-gray-50'
              )}
            >
              <span className="mb-1">{format(day, 'd')}</span>
              
              {/* Appointment Indicators */}
              {dayAppointments.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {dayAppointments.slice(0, 3).map((appointment, index) => (
                    <div
                      key={appointment.id}
                      className={cn(
                        'w-2 h-2 rounded-full',
                        getStatusColor(appointment.status),
                        isSelected && 'bg-white'
                      )}
                      title={`${appointment.status} - ${format(new Date(appointment.dataHora), 'HH:mm')}`}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayAppointments.length - 3}</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Pré-agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  );
} 