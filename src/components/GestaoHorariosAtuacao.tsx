'use client';

import { useState, useEffect, useRef } from 'react';
import { HorarioAtuacao } from '@prisma/client';
import { Clock, Trash2, PlusCircle, Check, X, Loader2 } from 'lucide-react';
import Modal from './Modal';

const DIAS_SEMANA = [
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
  { id: 0, nome: 'Domingo' },
];

const AddTimeForm = ({ diaDaSemana, onSave, onCancel, initialHoraInicio, initialHoraFim, initialAlmocoInicio, initialAlmocoFim }: { diaDaSemana: number, onSave: (data: { diaDaSemana: number, horaInicio: string, horaFim: string, almocoInicio?: string, almocoFim?: string }) => void, onCancel: () => void, initialHoraInicio: string, initialHoraFim: string, initialAlmocoInicio: string, initialAlmocoFim: string }) => {
  const [horaInicio, setHoraInicio] = useState(initialHoraInicio);
  const [horaFim, setHoraFim] = useState(initialHoraFim);
  const [almocoInicio, setAlmocoInicio] = useState(initialAlmocoInicio);
  const [almocoFim, setAlmocoFim] = useState(initialAlmocoFim);
  const [error, setError] = useState('');
  const isEditing = !!(initialHoraInicio || initialHoraFim || initialAlmocoInicio || initialAlmocoFim);
  const isUnchanged =
    horaInicio === initialHoraInicio &&
    horaFim === initialHoraFim &&
    almocoInicio === initialAlmocoInicio &&
    almocoFim === initialAlmocoFim;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isEditing && isUnchanged) {
      setError('Nenhuma alteração detectada.');
      return;
    }
    if (!horaInicio || !horaFim) {
      setError('Preencha o horário de início e fim.');
      return;
    }
    if (horaInicio >= horaFim) {
      setError('O horário de início deve ser menor que o de fim.');
      return;
    }
    if ((almocoInicio && !almocoFim) || (!almocoInicio && almocoFim)) {
      setError('Preencha ambos os campos de almoço ou deixe ambos em branco.');
      return;
    }
    if (almocoInicio && almocoFim && (almocoInicio >= almocoFim)) {
      setError('O início do almoço deve ser menor que o fim do almoço.');
      return;
    }
    onSave({ diaDaSemana, horaInicio, horaFim, almocoInicio, almocoFim });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mt-2 flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 mb-1">Início</label>
          <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 mb-1">Fim</label>
          <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900" required />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 mb-1">Início do Almoço (opcional)</label>
          <input type="time" value={almocoInicio} onChange={e => setAlmocoInicio(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 mb-1">Fim do Almoço (opcional)</label>
          <input type="time" value={almocoFim} onChange={e => setAlmocoFim(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-900" />
        </div>
      </div>
      {error && <p className="text-red-600 bg-red-50 p-2 rounded text-center text-sm">{error}</p>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all" disabled={isEditing && isUnchanged}>Salvar</button>
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition-all">Cancelar</button>
    </div>
    </form>
  );
};

export default function GestaoHorariosAtuacao() {
  const [horarios, setHorarios] = useState<HorarioAtuacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingHorario, setEditingHorario] = useState<HorarioAtuacao | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const highlightTimeout = useRef<NodeJS.Timeout | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState<number | null>(null);

  const fetchHorarios = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
    const response = await fetch('/api/admin/horarios-atuacao');
      if (!response.ok) {
        if (response.status === 401) {
          setErrorMsg('Você não tem permissão para acessar os horários de atuação. Faça login como admin.');
        } else {
          setErrorMsg('Erro ao buscar horários de atuação.');
        }
        setHorarios([]);
        setDebugLog('[]');
        setLoading(false);
        return;
      }
    const data = await response.json();
    setHorarios(data);
      setDebugLog(JSON.stringify(data, null, 2));
      if (!Array.isArray(data) || data.length === 0) {
        setErrorMsg('Nenhum horário cadastrado foi encontrado.');
      }
    } catch (err) {
      setErrorMsg('Erro inesperado ao buscar horários.');
      setHorarios([]);
      setDebugLog('[]');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHorarios();
    return () => {
      if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    };
  }, []);

  const handleSaveTime = async (data: any) => {
    let url = '/api/admin/horarios-atuacao';
    let method = 'POST';
    if (editingHorario) {
      url = `/api/admin/horarios-atuacao/${editingHorario.id}`;
      method = 'PUT';
    }
    try {
      const resp = await fetch(url, {
        method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
      if (!resp.ok) {
        setErrorMsg('Erro ao salvar horário. Verifique as permissões e tente novamente.');
        return;
      }
      setSuccessMsg(editingHorario ? 'Horário editado com sucesso!' : 'Horário salvo com sucesso!');
      await fetchHorarios();
    setEditingDay(null);
      setEditingHorario(null);
      highlightTimeout.current && clearTimeout(highlightTimeout.current);
      setHighlightedId(editingHorario ? editingHorario.id : null);
      highlightTimeout.current = setTimeout(() => setHighlightedId(null), 2000);
    } catch (err) {
      setErrorMsg('Erro inesperado ao salvar horário.');
    }
  };

  const handleEditTime = (horario: HorarioAtuacao) => {
    setEditingDay(horario.diaDaSemana);
    setEditingHorario(horario);
  };

  const handleRemoveTime = async (id: number) => {
    setHorarioToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmRemoveTime = async () => {
    if (horarioToDelete !== null) {
      try {
        const resp = await fetch(`/api/admin/horarios-atuacao/${Number(horarioToDelete)}`, { method: 'DELETE' });
        if (!resp.ok) {
          setErrorMsg('Erro ao remover horário. Tente novamente.');
          return;
        }
        await fetchHorarios();
        setHorarioToDelete(null);
        setShowDeleteModal(false);
      } catch (err) {
        setErrorMsg('Erro inesperado ao remover horário.');
      }
    }
  };

  const cancelRemoveTime = () => {
    setHorarioToDelete(null);
    setShowDeleteModal(false);
  };

  const handleCancel = () => {
    setEditingDay(null);
    setEditingHorario(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Horários de Atuação Padrão</h2>
      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-center font-medium animate-fade-in">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-center font-medium animate-fade-in">{errorMsg}</div>}
      <div className="space-y-4">
        {DIAS_SEMANA.map(dia => (
          <div key={dia.id}>
            <h3 className="font-medium text-gray-700 mb-2">{dia.nome}</h3>
            <div className="space-y-2">
              {horarios.filter(h => h.diaDaSemana === dia.id).map(h => (
                <div key={h.id} className={`flex items-center justify-between bg-gray-50 p-2.5 rounded-lg transition-all duration-500 ${highlightedId === h.id ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-800">{h.horaInicio} - {h.horaFim}</span>
                    {h.almocoInicio && h.almocoFim && (
                      <span className="text-xs text-gray-500 ml-2">(Almoço: {h.almocoInicio} - {h.almocoFim})</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTime(h)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100" title="Editar"><Check className="h-4 w-4" /></button>
                    <button onClick={() => handleRemoveTime(h.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {horarios.filter(h => h.diaDaSemana === dia.id).length === 0 && !loading && editingDay !== dia.id && (
                <p className="text-sm text-gray-400 italic px-2">Nenhum horário definido.</p>
              )}
            </div>
            {editingDay === dia.id ? (
              <AddTimeForm
                diaDaSemana={dia.id}
                onSave={handleSaveTime}
                onCancel={handleCancel}
                initialHoraInicio={editingHorario?.horaInicio || ''}
                initialHoraFim={editingHorario?.horaFim || ''}
                initialAlmocoInicio={editingHorario?.almocoInicio || ''}
                initialAlmocoFim={editingHorario?.almocoFim || ''}
              />
            ) : (
              <button onClick={() => { setEditingDay(dia.id); setEditingHorario(null); }} className="text-sm text-blue-600 hover:text-blue-800 mt-2 flex items-center font-semibold">
                <PlusCircle size={16} className="mr-1.5" />
                Adicionar horário
              </button>
            )}
          </div>
        ))}
        {loading && <div className="flex justify-center items-center min-h-[60px]"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>}
      </div>
      {/* Modal de confirmação de exclusão - sempre fora do loop */}
      <Modal isOpen={showDeleteModal} onClose={cancelRemoveTime} title="Remover Horário de Atuação?">
        <div className="text-center">
          <p className="mb-6 text-gray-700">Tem certeza que deseja remover este horário de atuação? Esta ação não poderá ser desfeita.</p>
          <div className="flex justify-center gap-4">
            <button onClick={cancelRemoveTime} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium">Cancelar</button>
            <button onClick={confirmRemoveTime} className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold">Remover</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Atualizar AddTimeForm para aceitar valores iniciais para edição
AddTimeForm.defaultProps = {
  initialHoraInicio: '',
  initialHoraFim: '',
  initialAlmocoInicio: '',
  initialAlmocoFim: '',
};
