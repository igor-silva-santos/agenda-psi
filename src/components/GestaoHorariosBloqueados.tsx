'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarOff, Trash2, PlusCircle, Loader2 } from 'lucide-react';

export default function GestaoHorariosBloqueados() {
  const [horariosBloqueados, setHorariosBloqueados] = useState<Array<{ id: number; dataHoraInicio: Date; dataHoraFim: Date }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchHorariosBloqueados = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/horarios-bloqueados');
    const data = await response.json();
    // Ordena para mostrar os bloqueios mais recentes primeiro
    setHorariosBloqueados(data.sort((a: { id: number; dataHoraInicio: Date; dataHoraFim: Date }, b: { id: number; dataHoraInicio: Date; dataHoraFim: Date }) => new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    fetchHorariosBloqueados();
  }, []);

  const handleAddBlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dataHoraInicio = formData.get('inicio') as string;
    const dataHoraFim = formData.get('fim') as string;
    const motivo = formData.get('motivo') as string;

    if (dataHoraInicio && dataHoraFim) {
      await fetch('/api/admin/horarios-bloqueados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dataHoraInicio: new Date(dataHoraInicio).toISOString(),
          dataHoraFim: new Date(dataHoraFim).toISOString(),
          motivo 
        }),
      });
      fetchHorariosBloqueados();
      e.currentTarget.reset();
    }
  };

  const handleRemoveBlock = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este período de bloqueio?')) {
      await fetch(`/api/admin/horarios-bloqueados/${id}`, { method: 'DELETE' });
      fetchHorariosBloqueados();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Períodos de Bloqueio</h2>
      
      <form onSubmit={handleAddBlock} className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="inicio" className="block text-sm font-medium text-gray-700 mb-1">Início</label>
            <input type="datetime-local" id="inicio" name="inicio" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label htmlFor="fim" className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
            <input type="datetime-local" id="fim" name="fim" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>
        <div>
          <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
          <input type="text" id="motivo" name="motivo" placeholder="Ex: Férias, Conferência..." className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2">
          <PlusCircle size={18}/>
          Adicionar Bloqueio
        </button>
      </form>

      <h3 className="font-medium text-gray-700 mb-3">Bloqueios Agendados</h3>
      {loading && <div className="flex justify-center items-center min-h-[60px]"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : horariosBloqueados.length > 0 ? (
          horariosBloqueados.map(block => (
            <div key={block.id} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
              <div className="flex items-center">
                <CalendarOff className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-red-800">{'Período bloqueado'}</p>
                    <p className="text-xs text-red-700">
                        {format(new Date(block.dataHoraInicio), "dd/MM/yy HH:mm", { locale: ptBR })} até {format(new Date(block.dataHoraFim), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </p>
                </div>
              </div>
              <button onClick={() => handleRemoveBlock(block.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-200 ml-2">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">Nenhum período de bloqueio agendado.</p>
        )}
      </div>
    </div>
  );
}
