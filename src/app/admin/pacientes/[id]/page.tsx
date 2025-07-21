'use client';

import { useEffect, useState } from 'react';
import { Agendamento, User } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import ProntuarioForm from '@/components/ProntuarioForm';
import RecomendacoesForm from '@/components/RecomendacoesForm';
import ProntuarioFormAgendamento from '@/components/ProntuarioFormAgendamento';
import RecomendacoesFormAgendamento from '@/components/RecomendacoesFormAgendamento';

interface PacienteDetalhes extends User {
  agendamentos: Agendamento[];
}

export default function AdminPacienteDetalhesPage() {
  const [paciente, setPaciente] = useState<PacienteDetalhes | null>(null);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchPaciente = async () => {
        try {
          const response = await fetch(`/api/admin/pacientes/${id}`);
          if (!response.ok) throw new Error('Falha ao buscar detalhes do paciente');
          const data = await response.json();
          setPaciente(data);
        } catch (error) {
          console.error('Erro ao buscar paciente:', error);
        }
      };
      fetchPaciente();
    }
  }, [id]);

  const handleSaveProntuario = async (prontuario: string) => {
    try {
      await fetch(`/api/admin/pacientes/${id}/prontuario`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prontuario }),
      });
      // Optionally, refresh paciente data after saving prontuario
      if (id) {
        const response = await fetch(`/api/admin/pacientes/${id}`);
        const data = await response.json();
        setPaciente(data);
      }
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error);
    }
  };

  const handleSaveRecomendacoes = async (recomendacoes: string) => {
    try {
      await fetch(`/api/admin/pacientes/${id}/recomendacoes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recomendacoes }),
      });
      if (id) {
        const response = await fetch(`/api/admin/pacientes/${id}`);
        const data = await response.json();
        setPaciente(data); // Atualiza os dados do paciente para mostrar a recomendação
      }
    } catch (error) {
      console.error('Erro ao salvar recomendações:', error);
    }
  };

  if (!paciente) return <p>Paciente não encontrado.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Detalhes do Paciente: {paciente.name}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informações do Paciente</h2>
        <p><strong>E-mail:</strong> {paciente.email}</p>
        <p><strong>CPF:</strong> {paciente.cpf || 'Não informado'}</p>
        <p><strong>Telefone:</strong> {paciente.telefone || 'Não informado'}</p>
        <p><strong>Função:</strong> {paciente.role}</p>
      </div>

      {/* Remover blocos antigos de prontuário e recomendações por paciente */}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Histórico de Agendamentos</h2>
        {paciente.agendamentos.length > 0 ? (
          <ul className="list-disc pl-5">
            {paciente.agendamentos.map(agendamento => (
              <li key={agendamento.id} className="mb-6">
                <div className="mb-2">
                  <strong>{format(new Date(agendamento.dataHora), 'dd/MM/yyyy HH:mm')}</strong> - {agendamento.status}
                </div>
                <div className="mb-2">
                  <ProntuarioFormAgendamento agendamentoId={agendamento.id} />
                </div>
                <div>
                  <RecomendacoesFormAgendamento agendamentoId={agendamento.id} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum agendamento para este paciente.</p>
        )}
      </div>
    </div>
  );
}
