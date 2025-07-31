import { useEffect, useState } from 'react';
import ProntuarioForm from './ProntuarioForm';

export default function ProntuarioFormAgendamento({ agendamentoId }: { agendamentoId: string }) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProntuario = async () => {
      setLoading(true);
      const res = await fetch(`/api/agendamentos/${agendamentoId}/prontuario`);
      if (res.ok) {
        const data = await res.json();
        setTexto(data?.texto || '');
      }
      setLoading(false);
    };
    fetchProntuario();
  }, [agendamentoId]);

  const handleSave = async (novoTexto: string) => {
    await fetch(`/api/agendamentos/${agendamentoId}/prontuario`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: novoTexto }),
    });
    setTexto(novoTexto);
  };

  if (loading) return <div>Carregando prontuário...</div>;

  return (
    <ProntuarioForm initialProntuario={texto} onSave={handleSave} placeholder="Digite o prontuário deste agendamento..." />
  );
} 