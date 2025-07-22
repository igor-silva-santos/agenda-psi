'use client';

import { useState, useEffect } from 'react';
import GestaoCalendario from '@/components/GestaoCalendario';
import GestaoHorariosAtuacao from '@/components/GestaoHorariosAtuacao';
import GestaoHorariosBloqueados from '@/components/GestaoHorariosBloqueados';
import Modal from '@/components/Modal';
import { BookableSlot } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

// Componente para visualizar e gerenciar os slots de um dia específico
const VisualizacaoDia = ({ date, onActionComplete }: { date: Date, onActionComplete: () => void }) => {
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyHoraInicio, setDailyHoraInicio] = useState<string>('');
  const [dailyHoraFim, setDailyHoraFim] = useState<string>('');
  const [dailyAlmocoInicio, setDailyAlmocoInicio] = useState<string>('');
  const [dailyAlmocoFim, setDailyAlmocoFim] = useState<string>('');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/disponibilidade-diaria/${format(date, 'yyyy-MM-dd')}`);
      if (response.status === 401) {
        console.error('Redirecionando para login por 401 (disponibilidade):', response);
        localStorage.setItem('sessaoExpirada', 'true');
        window.location.href = '/conta/login';
        return;
      }
      if (!response.ok) throw new Error('Falha ao carregar horários.');
      const data = await response.json();
      setSlots(data.slots || []);
      // Preencher os estados com os dados de DisponibilidadeDiaria, se existirem
      if (data.disponibilidade) {
        const parsedHorarios = data.disponibilidade.horarios ? JSON.parse(data.disponibilidade.horarios) : [];
        setDailyHoraInicio(parsedHorarios.length > 0 ? parsedHorarios[0].start : '');
        setDailyHoraFim(parsedHorarios.length > 0 ? parsedHorarios[parsedHorarios.length - 1].end : '');
        setDailyAlmocoInicio(data.disponibilidade.almocoInicio || '');
        setDailyAlmocoFim(data.disponibilidade.almocoFim || '');
      } else {
        // Reset if no daily availability is found
        setDailyHoraInicio('');
        setDailyHoraFim('');
        setDailyAlmocoInicio('');
        setDailyAlmocoFim('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [date]);

  // Atualiza a lista quando a ação no modal for concluída
  useEffect(() => {
    fetchSlots();
  }, [onActionComplete]);

  const handleSaveDailyAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin/disponibilidade-diaria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd'),
          horaInicio: dailyHoraInicio,
          horaFim: dailyHoraFim,
          almocoInicio: dailyAlmocoInicio,
          almocoFim: dailyAlmocoFim,
        }),
      });
      if (response.status === 401) {
        window.location.href = '/conta/login';
        return;
      }
      let errorMsg = 'Falha ao salvar disponibilidade diária.';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch {
        const text = await response.text();
        errorMsg = text || errorMsg;
      }
      if (!response.ok) {
        throw new Error(errorMsg);
      }
      fetchSlots(); // Atualiza a lista de slots após salvar
    } catch (error) {
      console.error('Erro ao salvar disponibilidade diária:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Definir Horários para {format(date, "eeee, dd 'de' MMMM", { locale: ptBR })}</h2>
        <form onSubmit={handleSaveDailyAvailability} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dailyHoraInicio" className="block text-sm font-medium text-gray-700">Início da Atuação:</label>
              <input
                type="time"
                id="dailyHoraInicio"
                value={dailyHoraInicio}
                onChange={e => setDailyHoraInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="dailyHoraFim" className="block text-sm font-medium text-gray-700">Fim da Atuação:</label>
              <input
                type="time"
                id="dailyHoraFim"
                value={dailyHoraFim}
                onChange={e => setDailyHoraFim(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dailyAlmocoInicio" className="block text-sm font-medium text-gray-700">Início do Almoço (Opcional):</label>
              <input
                type="time"
                id="dailyAlmocoInicio"
                value={dailyAlmocoInicio}
                onChange={e => setDailyAlmocoInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="dailyAlmocoFim" className="block text-sm font-medium text-gray-700">Fim do Almoço (Opcional):</label>
              <input
                type="time"
                id="dailyAlmocoFim"
                value={dailyAlmocoFim}
                onChange={e => setDailyAlmocoFim(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Salvar Disponibilidade do Dia
          </button>
        </form>
      </div>

      {/* ... (código da lista de slots) ... */}
      

      {isModalOpen && (
        <ConfirmationModal 
          date={date} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSlots(); // Atualiza a lista de slots
          }}
        />
      )}
    </>
  );
};

// Modal de Confirmação específico para esta ação
const ConfirmationModal = ({ date, onClose, onSuccess }: { date: Date, onClose: () => void, onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/generate-bookable-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: format(date, 'yyyy-MM-dd') })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao gerar horários.');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Confirmar Geração de Horários">
      <div>
        <p className="text-sm text-gray-600 mb-4">Deseja gerar horários para <strong>{format(date, 'dd/MM/yyyy')}</strong>? A ação criará horários de 1 hora com base na sua atuação padrão, pulando conflitos.</p>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isLoading} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50">Cancelar</button>
          <button onClick={handleConfirm} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:bg-blue-400">
            {isLoading ? 'Gerando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};


export default function AdminDisponibilidadePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [actionCount, setActionCount] = useState(0);

  // Usado para forçar a re-renderização do componente filho quando uma ação é concluída
  const handleActionComplete = () => {
    setActionCount(prev => prev + 1);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Disponibilidade</h1>
          <p className="text-md text-gray-600 mt-1">Defina seus horários de trabalho, bloqueios e visualize sua agenda dia a dia.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Coluna da Esquerda: Horários de Atuação e Bloqueados */}
          <div className="space-y-8">
            <GestaoHorariosAtuacao />
            <GestaoHorariosBloqueados />
          </div>

          {/* Coluna da Direita: Calendário e Visualização do Dia */}
          <div className="space-y-8">
            <GestaoCalendario selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            {selectedDate && <VisualizacaoDia key={actionCount} date={selectedDate} onActionComplete={handleActionComplete} />}
          </div>
        </div>
      </div>
    </div>
  );
}
