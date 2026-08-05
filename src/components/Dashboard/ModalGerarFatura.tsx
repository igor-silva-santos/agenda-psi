'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Receipt } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

interface Paciente {
  id: string;
  name: string;
}

interface AgendamentoPendente {
  id: string;
  dataHora: string;
  status: string;
}

interface ModalGerarFaturaProps {
  onClose: () => void;
  onGerada: () => void;
}

export default function ModalGerarFatura({ onClose, onGerada }: ModalGerarFaturaProps) {
  const { addToast } = useToast();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [agendamentos, setAgendamentos] = useState<AgendamentoPendente[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [dataVencimento, setDataVencimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pacientes')
      .then(res => res.json())
      .then(setPacientes)
      .catch(() => addToast('Erro ao carregar pacientes.', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pacienteId) {
      setAgendamentos([]);
      return;
    }
    setLoadingAgendamentos(true);
    setSelecionados([]);
    fetch(`/api/admin/agendamentos/pendentes-faturamento?pacienteId=${pacienteId}`)
      .then(res => res.json())
      .then(setAgendamentos)
      .catch(() => addToast('Erro ao carregar consultas pendentes.', 'error'))
      .finally(() => setLoadingAgendamentos(false));
  }, [pacienteId]);

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId || selecionados.length === 0 || !dataVencimento) {
      addToast('Selecione o paciente, ao menos uma consulta e a data de vencimento.', 'error');
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch('/api/admin/faturas/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId,
          agendamentoIds: selecionados,
          dataVencimento,
          observacao: observacao || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Erro ao gerar fatura.', 'error');
        return;
      }
      addToast('Fatura gerada com sucesso!', 'success');
      onGerada();
      onClose();
    } catch {
      addToast('Erro de conexão ao gerar fatura.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col h-full max-w-lg mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Gerar Fatura</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Paciente</label>
            <select
              value={pacienteId}
              onChange={e => setPacienteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
            >
              <option value="">Selecione...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {pacienteId && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                Consultas a faturar
              </label>
              {loadingAgendamentos ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                </div>
              ) : agendamentos.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">Nenhuma consulta pendente de faturamento para este paciente.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                  {agendamentos.map(a => (
                    <label key={a.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(a.id)}
                        onChange={() => toggleSelecionado(a.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{new Date(a.dataHora).toLocaleString('pt-BR')}</span>
                      <span className="text-xs text-gray-400 ml-auto">{a.status}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Data de vencimento</label>
            <input
              type="date"
              value={dataVencimento}
              onChange={e => setDataVencimento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Observação (opcional)</label>
            <textarea
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {salvando ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</> : 'Gerar Fatura'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
