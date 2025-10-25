'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isToday, isPast, parseISO, startOfDay, addMinutes, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookableSlot } from '@prisma/client';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

export default function AdminBookableSlotManager() {
  const [allSlots, setAllSlots] = useState<BookableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/bookable-slots/all");
      if (!response.ok) {
        throw new Error("Failed to fetch bookable slots");
      }
      const data: BookableSlot[] = await response.json();
      setAllSlots(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleGenerateSlots = async () => {
    if (!selectedDay || !startTime || !endTime) {
      alert("Por favor, selecione um dia, hora de início e hora de fim.");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/generate-bookable-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDay.toISOString(),
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao gerar horários.");
      }
      setStartTime('');
      setEndTime('');
      fetchSlots(); // Recarrega os slots
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este horário?")) return;
    setError(null);
    try {
      const response = await fetch(`/api/bookable-slots/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Falha ao remover horário.");
      }
      fetchSlots(); // Recarrega os slots
    } catch (err: any) {
      setError(err.message);
    }
  };

  const availableDates = allSlots.map(slot => startOfDay(parseISO(slot.dataHora.toString())));
  const uniqueAvailableDates = Array.from(new Set(availableDates.map(date => date.toISOString()))).map(isoDate => new Date(isoDate));

  const disabledDays = [
    { before: startOfDay(new Date()) }, // Desabilita dias passados
  ];

  const selectedDaySlots = selectedDay
    ? allSlots.filter(slot => startOfDay(parseISO(slot.dataHora.toString())).getTime() === startOfDay(selectedDay).getTime())
    : [];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Coluna do Calendário */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Selecione um Dia</h3>
        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={setSelectedDay}
          disabled={disabledDays}
          locale={ptBR}
          showOutsideDays
          modifiersClassNames={{
            selected: 'my-selected',
            today: 'my-today',
          }}
          styles={{
            caption: { color: '#3B82F6' },
            day: {
              borderRadius: '0.5rem',
              transition: 'background-color 0.2s ease-in-out',
            },
          }}
        />
      </div>

      {/* Coluna de Gerenciamento de Horários */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Gerenciar Horários do Dia</h3>
        {loading ? (
          <div className="flex justify-center items-center min-h-[120px]"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
        ) : (
          <>
        {selectedDay ? (
          <>
            <p className="text-gray-700 mb-4">Horários para: <span className="font-medium">{format(selectedDay, 'dd/MM/yyyy')}</span></p>
            
            {error && <p className="text-red-500 mb-4">Erro: {error}</p>}

            {/* Adicionar Novo Horário */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Gerar Horários para o Dia</h4>
              <div className="flex flex-col gap-2">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Início:</label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="p-2 border rounded-md text-gray-900"
                  step="1800" // Permite seleção de 30 em 30 minutos
                />
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Fim:</label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="p-2 border rounded-md text-gray-900"
                  step="1800" // Permite seleção de 30 em 30 minutos
                />
                <button
                  onClick={handleGenerateSlots}
                  className="mt-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  disabled={isAdding}
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle size={20} />} Gerar Horários
                </button>
              </div>
            </div>

            {/* Lista de Horários Existentes */}
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Horários Existentes</h4>
            {selectedDaySlots.length > 0 ? (
              <ul className="space-y-2">
                {selectedDaySlots.map((slot) => (
                  <li key={slot.id} className="flex justify-between items-center p-3 border rounded-md shadow-sm bg-white">
                    <span className="text-gray-800">
                      {format(parseISO(slot.dataHora.toString()), 'HH:mm')} - {format(addMinutes(parseISO(slot.dataHora.toString()), 30), 'HH:mm')}
                      {!slot.disponivel && <span className="ml-2 text-red-500 font-medium">(Agendado)</span>}
                    </span>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">Nenhum horário cadastrado para este dia.</p>
            )}
          </>
        ) : (
          <p className="text-gray-700">Selecione um dia no calendário para gerenciar os horários.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}