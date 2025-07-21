'use client';

import { useEffect, useState } from "react";
import { BookableSlot } from "@prisma/client";
import { format, isToday, isPast, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Loader2 } from 'lucide-react';

interface BookableSlotPickerProps {
  onSelectSlot: (slot: BookableSlot) => void;
  selectedSlot: string | null;
  darkMode?: boolean;
}

export default function BookableSlotPicker({ onSelectSlot, selectedSlot, darkMode }: BookableSlotPickerProps) {
  const [allSlots, setAllSlots] = useState<BookableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function fetchSlots() {
      try {
        // Buscar todos os horários, incluindo os já agendados
        const response = await fetch("/api/bookable-slots?all=true");
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
    }
    fetchSlots();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-[120px]"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  if (error) return <p className="text-red-500">Erro ao carregar horários: {error}</p>;

  const availableDates = allSlots.map(slot => startOfDay(parseISO(slot.startDateTime.toString())));
  const uniqueAvailableDates = Array.from(new Set(availableDates.map(date => date.toISOString()))).map(isoDate => new Date(isoDate));

  const disabledDays = [
    { before: startOfDay(new Date()) }, // Desabilita todos os dias antes de hoje
    (date: Date) => !uniqueAvailableDates.some(availableDate => availableDate.getTime() === startOfDay(date).getTime()), // Desabilita dias sem horários disponíveis
  ];

  const selectedDaySlots = selectedDay
    ? allSlots.filter(slot => startOfDay(parseISO(slot.startDateTime.toString())).getTime() === startOfDay(selectedDay).getTime())
    : [];

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 w-full justify-center">
      <div className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 mx-auto md:mx-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 flex items-center justify-center min-h-[340px]">
        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={setSelectedDay}
          disabled={disabledDays}
          locale={ptBR}
          showOutsideDays
          modifiersClassNames={{
            selected: darkMode ? 'my-selected-dark' : 'my-selected',
            today: darkMode ? 'my-today-dark' : 'my-today',
          }}
          styles={{
            caption: { color: '#1e293b', fontWeight: 700 }, // azul-escuro
            day: {
              borderRadius: '0.5rem',
              transition: 'background-color 0.2s ease-in-out',
              color: '#1e293b', // sempre texto escuro
              fontWeight: 500,
              fontSize: '1rem',
              background: 'transparent',
            },
            head_cell: { color: '#1e293b', fontWeight: 700, fontSize: '1rem', background: 'transparent' },
            cell: { background: 'transparent' },
          }}
        />
        <style jsx global>{`
          .my-selected-dark {
            background: #1e293b !important;
            color: #fff !important;
            font-weight: bold;
          }
          .my-today-dark {
            border: 2px solid #1e293b !important;
            color: #1e293b !important;
            background: #e0e7ef !important;
          }
        `}</style>
      </div>
      <div className="flex-1 mt-6 md:mt-0 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm min-w-[220px] max-w-[340px] mx-auto md:mx-0">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Horários para {selectedDay ? format(selectedDay, 'dd/MM/yyyy') : 'selecione um dia'}</h3>
        {selectedDaySlots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedDaySlots.map((slot) => {
              const slotDate = parseISO(slot.startDateTime.toString());
              const isSlotPast = isPast(slotDate);
              const isDisabled = slot.isBooked || isSlotPast;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-full border transition-colors duration-200
                    ${slot.id !== undefined && selectedSlot === slot.id.toString()
                      ? (darkMode ? 'bg-blue-900 text-white border-blue-900' : 'bg-blue-600 text-white border-blue-600')
                      : isDisabled
                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed line-through'
                        : (darkMode ? 'bg-gray-100 text-gray-900 border-gray-400 hover:bg-blue-100 hover:border-blue-700' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400')
                    }`}
                >
                  {format(slotDate, 'HH:mm')}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-900">Nenhum horário disponível para este dia.</p>
        )}
      </div>
    </div>
  );
}
