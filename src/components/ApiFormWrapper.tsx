import { useEffect, useState } from 'react';
import TextAreaForm from './TextAreaForm';

interface ApiFormWrapperProps {
  agendamentoId: string;
  apiEndpoint: 'prontuario' | 'recomendacoes';
  placeholder: string;
  buttonText: string;
  rows?: number;
}

export default function ApiFormWrapper({ 
  agendamentoId, 
  apiEndpoint,
  placeholder,
  buttonText,
  rows
}: ApiFormWrapperProps) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/agendamentos/${agendamentoId}/${apiEndpoint}`);
      if (res.ok) {
        const data = await res.json();
        setTexto(data?.texto || '');
      }
      setLoading(false);
    };
    fetchData();
  }, [agendamentoId, apiEndpoint]);

  const handleSave = async (novoTexto: string) => {
    await fetch(`/api/agendamentos/${agendamentoId}/${apiEndpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: novoTexto }),
    });
    setTexto(novoTexto);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <TextAreaForm 
      initialValue={texto} 
      onSave={handleSave} 
      placeholder={placeholder}
      buttonText={buttonText}
      rows={rows}
    />
  );
} 
