'use client';

import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { format, isAfter } from 'date-fns';

interface GestaoCalendarioProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  // Adicionar feriados ou dias bloqueados para estilização no futuro
}

interface ExcecaoDisponibilidade {
  id: number;
  data: string; // yyyy-MM-dd
  horaInicio: string;
  horaFim: string;
}

export default function GestaoCalendario({ selectedDate, onSelectDate }: GestaoCalendarioProps) {
  const [excecoes, setExcecoes] = useState<ExcecaoDisponibilidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExcecoes() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/disponibilidade-diaria');
        const data = await res.json();
        if (data && data.disponibilidades) {
          setExcecoes(data.disponibilidades.filter((d: any) => isAfter(new Date(d.data), new Date()) || format(new Date(d.data), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')));
        } else if (data && data.disponibilidades) {
          setExcecoes(data.disponibilidades);
        } else {
          setExcecoes([]);
        }
      } catch {
        setExcecoes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchExcecoes();
  }, []);

  // Dias com exceção para destacar no calendário
  const diasComExcecao = excecoes.map(e => new Date(e.data));

  // Eventos futuros (exceções)
  const eventosFuturos = excecoes.filter(e => isAfter(new Date(e.data + 'T' + e.horaFim), new Date()));
  const eventosPassados = excecoes.filter(e => !isAfter(new Date(e.data + 'T' + e.horaFim), new Date()));

  // Evento do dia selecionado
  const eventoSelecionado = selectedDate ? excecoes.find(e => format(new Date(e.data), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) : null;

  // Adicionar classe para o dia selecionado
  const customClassNames = {
    root: 'w-full',
    caption: 'flex justify-center items-center h-10',
    head_cell: 'w-full h-10 font-semibold text-sm text-gray-600',
    head_row: 'flex w-full mt-2',
    table: 'w-full border-collapse',
    row: 'flex w-full mt-2',
    cell: 'text-gray-600 h-10 w-10 flex items-center justify-center text-sm relative',
    day: 'h-10 w-10 rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center',
    day_selected: 'ring-2 ring-blue-300 bg-blue-600 text-white font-bold hover:bg-blue-700', // círculo azul claro
    day_today: 'font-bold text-blue-600',
    day_outside: 'text-gray-300',
    eventDay: 'bg-yellow-200 border-yellow-500 text-yellow-900 font-bold',
  };

  // Bloco de eventos futuros
  const BlocoEventos = (
    <div className="mt-6">
      <h3 className="text-md font-semibold text-gray-800 mb-2">Próximos eventos (exceções)</h3>
      {loading ? (
        <p className="text-gray-500">Carregando eventos...</p>
      ) : eventosFuturos.length === 0 ? (
        <p className="text-gray-500 italic">Nenhum evento futuro cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {eventosFuturos.map(ev => (
            <li key={ev.id} className="flex items-center gap-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <span className="font-medium text-yellow-900">{format(new Date(ev.data), 'dd/MM/yyyy')}</span>
              <span className="text-yellow-800">{ev.horaInicio} - {ev.horaFim}</span>
              {selectedDate && format(new Date(ev.data), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && <span className="ml-2 px-2 py-0.5 rounded bg-blue-200 text-blue-900 text-xs font-semibold">Selecionado</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecione uma Data</h2>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        locale={ptBR}
        disabled={{ before: new Date() }}
        modifiers={{
          eventDay: (date: Date) => diasComExcecao.some(d => d.toDateString() === date.toDateString())
        }}
        modifiersClassNames={{
          eventDay: 'bg-yellow-200 border-yellow-500 text-yellow-900 font-bold'
        }}
        classNames={customClassNames}
        formatters={{
          formatWeekdayName: (day, options) => {
            const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            return weekdays[day.getDay()];
          },
        }}
        className="w-full"
      />
      {/* Aviso do dia selecionado */}
      {selectedDate && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-sm">
          {eventoSelecionado ? (
            <span>Esta configuração vale apenas para o dia <b>{format(selectedDate, 'dd/MM/yyyy')}</b>. O padrão semanal não será alterado.</span>
          ) : (
            <span>Você pode definir uma exceção para o dia <b>{format(selectedDate, 'dd/MM/yyyy')}</b>. O padrão semanal será mantido para outros dias.</span>
          )}
        </div>
      )}
      {/* Eventos futuros */}
      {selectedDate ? null : BlocoEventos}
      {/* Eventos passados (opcional) */}
      {eventosPassados.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-1">Eventos passados</h4>
          <ul className="space-y-1">
            {eventosPassados.map(ev => (
              <li key={ev.id} className="text-gray-400 text-xs flex items-center gap-2">
                <span>{format(new Date(ev.data), 'dd/MM/yyyy')}</span>
                <span>{ev.horaInicio} - {ev.horaFim}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Se um dia está selecionado, mostrar bloco de eventos logo abaixo do painel de edição */}
      {selectedDate && BlocoEventos}
    </div>
  );
}