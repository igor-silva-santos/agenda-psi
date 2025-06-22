
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarioAgendamentoProps {
  onSelectDateTime: (date: Date, time: string) => void;
}

export default function CalendarioAgendamento({ onSelectDateTime }: CalendarioAgendamentoProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ [key: string]: string[] }>({});
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<{ [key: string]: string[] }>({});

  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0];
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0];

  const loadHorarios = useCallback(async () => {
    try {
      const response = await fetch(`/api/availability?start=${startDate}&end=${endDate}`);
      const data = await response.json();
      
      if (data.availableSlots) {
        setHorariosDisponiveis(data.availableSlots);
      } else {
        setHorariosDisponiveis({});
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setHorariosDisponiveis({});
    }
  }, [startDate, endDate]);

  const generateAvailableSlots = useCallback(() => {
    const slots: { [key: string]: string[] } = {};
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Usar horários da API se disponíveis
      if (horariosDisponiveis[dateStr]) {
        slots[dateStr] = horariosDisponiveis[dateStr];
      }
    }

    setAvailableSlots(slots);
  }, [currentDate, horariosDisponiveis]);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  useEffect(() => {
    generateAvailableSlots();
  }, [generateAvailableSlots]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const selectDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (availableSlots[dateStr] && availableSlots[dateStr].length > 0) {
      setSelectedDate(date);
    }
  };

  const selectTime = (time: string) => {
    if (selectedDate) {
      onSelectDateTime(selectedDate, time);
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots[dateStr] && availableSlots[dateStr].length > 0;
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendário */}
      <div>
        <div className="bg-white border rounded-lg p-6">
          {/* Header do calendário */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={index} className="h-10" />;
              }

              const isAvailable = isDateAvailable(date);
              const isPast = isDatePast(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <button
                  key={index}
                  onClick={() => selectDate(date)}
                  disabled={!isAvailable || isPast || isWeekend}
                  className={`
                    h-10 text-sm rounded-lg transition-colors
                    ${isSelected 
                      ? 'bg-blue-600 text-white' 
                      : isAvailable && !isPast && !isWeekend
                        ? 'hover:bg-blue-100 text-gray-800'
                        : 'text-gray-400 cursor-not-allowed'
                    }
                    ${isAvailable && !isPast && !isWeekend ? 'bg-green-50 border border-green-200' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-gray-600">Disponível</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span className="text-gray-600">Indisponível</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horários */}
      <div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horários Disponíveis
          </h3>
          
          {selectedDate ? (
            <div>
              <p className="text-gray-600 mb-4">
                {selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {availableSlots[selectedDate.toISOString().split('T')[0]]?.map(time => (
                  <button
                    key={time}
                    onClick={() => selectTime(time)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecione uma data no calendário para ver os horários disponíveis</p>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Informações Importantes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Atendimento de segunda a sexta-feira</li>
            <li>• Duração da consulta: 50 minutos</li>
            <li>• Cancelamento com 24h de antecedência</li>
            <li>• Primeira consulta: R$ 120,00 (desconto de 20%)</li>
            <li>• Consultas seguintes: R$ 150,00</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


