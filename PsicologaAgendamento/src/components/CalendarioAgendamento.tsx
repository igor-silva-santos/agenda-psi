'use client';

import { useState, useEffect, useCallback } from 'react';
// CORREÇÃO: Removidos 'Calendar' e 'Clock' que não eram usados neste ficheiro.
import { ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react';

interface CalendarioAgendamentoProps {
  onSelect: (date: string, time: string) => void;
}

export default function CalendarioAgendamento({ onSelect }: CalendarioAgendamentoProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(true);

  const getMonthYear = (date: Date) => ({
    month: date.getMonth(),
    year: date.getFullYear(),
  });

  const loadHorarios = useCallback(async () => {
    setLoading(true);
    const { year, month } = getMonthYear(currentDate);
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
    
    try {
      const response = await fetch(`/api/availability?start=${startDate}&end=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAvailableSlots(data.availableSlots || {});
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setAvailableSlots({});
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = Array(startingDayOfWeek).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
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
      onSelect(selectedDate.toISOString().split('T')[0], time);
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

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-5 w-5 text-gray-700" /></button>
            <h3 className="text-lg font-semibold text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-5 w-5 text-gray-700" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="h-10" />;
              const available = isDateAvailable(date);
              const past = isDatePast(date);
              const selected = selectedDate?.toDateString() === date.toDateString();
              const weekend = date.getDay() === 0 || date.getDay() === 6;
              const disabled = !available || past || weekend;

              return (
                <button
                  key={date.toString()}
                  onClick={() => selectDate(date)}
                  disabled={disabled}
                  className={`h-10 text-sm rounded-lg transition-colors font-medium ${
                    selected ? 'bg-blue-600 text-white' :
                    disabled ? 'text-gray-400 cursor-not-allowed bg-gray-100' :
                    'hover:bg-blue-100 text-gray-900 bg-blue-50 border border-blue-200'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div><span className="text-gray-600">Disponível</span></div>
            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-100 rounded"></div><span className="text-gray-600">Indisponível</span></div>
          </div>
        </div>
      </div>
      <div>
        <div className="bg-white border rounded-lg p-6 min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800"><Clock className="h-5 w-5 mr-2" />Horários Disponíveis</h3>
          {loading ? (
            <div className="flex-grow flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
          ) : selectedDate ? (
            <div>
              <p className="text-gray-600 mb-4">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSlots[selectedDate.toISOString().split('T')[0]]?.map(time => (
                  <button key={time} onClick={() => selectTime(time)} className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-center font-medium text-gray-800">{time}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecione uma data disponível no calendário</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}