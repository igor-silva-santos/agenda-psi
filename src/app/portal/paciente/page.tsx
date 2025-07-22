'use client';

import { useEffect, useState } from 'react';
import { Agendamento } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function PacienteDashboard() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/portal/agendamentos');
        if (response.status === 401) {
          localStorage.setItem('sessaoExpirada', 'true');
          window.location.href = '/conta/login';
          return;
        }
        if (!response.ok) throw new Error('Falha ao buscar dados');
        const data = await response.json();
        setAgendamentos(data);
      } catch (err: any) {
        setError('Erro ao buscar');
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, []);

  const proximaConsulta = agendamentos
    .filter(a => new Date(a.dataHora) > new Date() && a.status === 'CONFIRMADO')
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-800" data-testid="titulo-dashboard">Dashboard do Paciente</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><span data-testid="loading">Carregando...</span></div>
      ) : error ? (
        <p className="text-red-500" data-testid="erro">{error}</p>
      ) : agendamentos.length === 0 ? (
        <h2 className="text-2xl font-semibold mb-4 text-blue-700" data-testid="vazio">Nenhuma consulta confirmada encontrada.</h2>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Sua Próxima Consulta</h2>
          <p className="text-lg mb-2"><strong>Data:</strong> {format(new Date(proximaConsulta.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          <p className="text-lg mb-2"><strong>Horário:</strong> {format(new Date(proximaConsulta.dataHora), "HH:mm", { locale: ptBR })}</p>
          <p className="text-lg mb-2"><strong>Status:</strong> <span className="font-semibold text-green-600">{proximaConsulta.status}</span></p>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
        <Link href="/portal/paciente/agendamentos" className="flex-1 bg-white rounded-lg shadow p-4 text-center hover:bg-blue-50 transition-colors font-medium text-blue-700">Meus Agendamentos</Link>
        <Link href="/portal/paciente/recomendacoes" className="flex-1 bg-white rounded-lg shadow p-4 text-center hover:bg-blue-50 transition-colors font-medium text-blue-700">Minhas Recomendações</Link>
        <Link href="/portal/paciente/perfil" className="flex-1 bg-white rounded-lg shadow p-4 text-center hover:bg-blue-50 transition-colors font-medium text-blue-700">Meu Perfil</Link>
      </div>
    </div>
  );
}
