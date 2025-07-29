'use client';

import { useEffect, useState } from "react";
import { BookableSlot } from "@prisma/client";
import { format, isToday, isPast, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Loader2, Calendar, Clock } from 'lucide-react';

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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600">Carregando horários disponíveis...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-600 font-medium">Erro ao carregar horários: {error}</p>
    </div>
  );

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
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 items-start">
        {/* Calendário */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-4 xl:p-8">
          <div className="flex items-center space-x-3 mb-4 xl:mb-6">
            <div className="p-2 xl:p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 xl:h-6 xl:w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg xl:text-xl font-bold text-gray-900">Selecione uma Data</h3>
              <p className="text-xs xl:text-sm text-gray-600">Escolha o dia da sua consulta</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 xl:p-6">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              disabled={disabledDays}
              locale={ptBR}
              showOutsideDays
              modifiersClassNames={{
                selected: 'my-selected-modern',
                today: 'my-today-modern',
                disabled: 'my-disabled-modern',
              }}
              styles={{
                caption: { 
                  color: '#1e40af', 
                  fontWeight: 700, 
                  fontSize: '1rem',
                  marginBottom: '0.75rem'
                },
                day: {
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease-in-out',
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  background: 'transparent',
                  width: '2rem',
                  height: '2rem',
                  margin: '0.125rem',
                },
                head_cell: { 
                  color: '#6b7280', 
                  fontWeight: 600, 
                  fontSize: '0.75rem', 
                  background: 'transparent',
                  padding: '0.25rem 0'
                },
                cell: { 
                  background: 'transparent',
                  padding: '0.125rem'
                },
                nav: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                },
                nav_button: {
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.375rem',
                  color: '#374151',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            />
          </div>
          
          <style jsx global>{`
            .my-selected-modern {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
              color: #ffffff !important;
              font-weight: 600 !important;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
              transform: scale(1.05) !important;
            }
            .my-today-modern {
              border: 2px solid #3b82f6 !important;
              color: #3b82f6 !important;
              background: #eff6ff !important;
              font-weight: 600 !important;
            }
            .my-disabled-modern {
              color: #d1d5db !important;
              background: #f9fafb !important;
              cursor: not-allowed !important;
            }
            .rdp-day:hover:not(.my-disabled-modern):not(.my-selected-modern) {
              background: #eff6ff !important;
              color: #1d4ed8 !important;
              transform: scale(1.05) !important;
            }
            .rdp-nav_button:hover {
              background-color: #e5e7eb !important;
              color: #1f2937 !important;
            }
          `}</style>
        </div>

        {/* Horários */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-4 xl:p-8">
          <div className="flex items-center space-x-3 mb-4 xl:mb-6">
            <div className="p-2 xl:p-3 bg-gray-100 rounded-lg">
              <Clock className="h-5 w-5 xl:h-6 xl:w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg xl:text-xl font-bold text-gray-900">Horários Disponíveis</h3>
              <p className="text-xs xl:text-sm text-gray-600">
                {selectedDay ? format(selectedDay, 'dd/MM/yyyy') : 'Selecione um dia primeiro'}
              </p>
            </div>
          </div>

          {selectedDaySlots.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 xl:gap-3">
                {selectedDaySlots.map((slot) => {
                  const slotDate = parseISO(slot.startDateTime.toString());
                  const isSlotPast = isPast(slotDate);
                  const isDisabled = slot.isBooked || isSlotPast;
                  const isSelected = slot.id !== undefined && selectedSlot === slot.id.toString();
                  
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSelectSlot(slot)}
                      disabled={isDisabled}
                      className={`
                        px-3 xl:px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl border-2 transition-all duration-200 font-medium text-xs xl:text-sm
                        ${isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg transform scale-105'
                          : isDisabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md'
                        }
                      `}
                    >
                      {format(slotDate, 'HH:mm')}
                    </button>
                  );
                })}
              </div>
              
              {selectedSlot && (
                <div className="mt-3 xl:mt-4 p-3 xl:p-4 bg-blue-50 border border-blue-200 rounded-lg xl:rounded-xl">
                  <p className="text-blue-800 font-medium text-sm xl:text-base">
                    ✅ Horário selecionado: {selectedDay && format(selectedDay, 'dd/MM/yyyy')} às {
                      selectedDaySlots.find(slot => slot.id?.toString() === selectedSlot) 
                        ? format(parseISO(selectedDaySlots.find(slot => slot.id?.toString() === selectedSlot)!.startDateTime.toString()), 'HH:mm')
                        : ''
                    }
                  </p>
                </div>
              )}
            </div>
          ) : selectedDay ? (
            <div className="text-center py-6 xl:py-8">
              <div className="p-3 xl:p-4 bg-yellow-50 border border-yellow-200 rounded-lg xl:rounded-xl">
                <p className="text-yellow-800 font-medium text-sm xl:text-base">Nenhum horário disponível para este dia</p>
                <p className="text-yellow-600 text-xs xl:text-sm mt-1">Tente selecionar outra data</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 xl:py-8">
              <div className="p-3 xl:p-4 bg-gray-50 border border-gray-200 rounded-lg xl:rounded-xl">
                <p className="text-gray-600 font-medium text-sm xl:text-base">Selecione uma data para ver os horários</p>
                <p className="text-gray-500 text-xs xl:text-sm mt-1">Os horários disponíveis aparecerão aqui</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
