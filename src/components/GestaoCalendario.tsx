'use client';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';

interface GestaoCalendarioProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  // Adicionar feriados ou dias bloqueados para estilização no futuro
}

export default function GestaoCalendario({ selectedDate, onSelectDate }: GestaoCalendarioProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecione uma Data</h2>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        locale={ptBR}
        disabled={{ before: new Date() }}
        formatters={{
          formatWeekdayName: (day, options) => {
            const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            return weekdays[day.getDay()];
          },
        }}
        className="w-full"
        classNames={{
          root: 'w-full',
          caption: 'flex justify-center items-center h-10',
          head_cell: 'w-full h-10 font-semibold text-sm text-gray-600',
          head_row: 'flex w-full mt-2',
          table: 'w-full border-collapse',
          row: 'flex w-full mt-2',
          cell: 'text-gray-600 h-10 w-10 flex items-center justify-center text-sm relative',
          day: 'h-10 w-10 rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center',
          day_selected: 'bg-blue-600 text-white font-bold hover:bg-blue-700',
          day_today: 'font-bold text-blue-600',
          day_outside: 'text-gray-300',
        }}
      />
    </div>
  );
}