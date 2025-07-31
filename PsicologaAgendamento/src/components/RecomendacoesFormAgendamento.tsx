import { useEffect, useState } from 'react';
import RecomendacoesForm from './RecomendacoesForm';

export default function RecomendacoesFormAgendamento({ agendamentoId }: { agendamentoId: string }) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecomendacao = async () => {
      setLoading(true);
      const res = await fetch(`/api/agendamentos/${agendamentoId}/recomendacoes`);
      if (res.ok) {
        const data = await res.json();
        setTexto(data?.texto || '');
      }
      setLoading(false);
    };
    fetchRecomendacao();
  }, [agendamentoId]);

  const handleSave = async (novoTexto: string) => {
    await fetch(`/api/agendamentos/${agendamentoId}/recomendacoes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: novoTexto }),
    });
    setTexto(novoTexto);
  };

  if (loading) return <div>Carregando recomendações...</div>;

  return (
    <RecomendacoesForm initialRecomendacoes={texto} onSave={handleSave} />
  );
} 