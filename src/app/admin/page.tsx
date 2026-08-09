"use client";

import { useEffect, useState } from 'react';
import { Agendamento, User } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Calendar, Users, Clock, BarChart2, AlertCircle, CheckCircle2, Hourglass, Loader2 } from 'lucide-react';

// Tipagem para o agendamento com dados do paciente
interface AgendamentoComPaciente extends Agendamento {
  user: User;
}

// Componente para os cartões de estatísticas
const StatCard = ({ title, value, icon: Icon, color = 'text-brand' }: { title: string, value: string | number, icon: React.ElementType, color?: string }) => (
  <div className="bg-white p-6 rounded-xl border border-muted flex items-center space-x-4 transition-transform hover:scale-[1.02]">
    <div className="bg-brand-100 p-3 rounded-full">
      <Icon className={`h-7 w-7 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-heading font-bold text-ink">{value}</p>
    </div>
  </div>
);

const ActionCard = ({ title, href, icon: Icon }: { title: string, href: string, icon: React.ElementType }) => (
  <Link href={href} className="cursor-pointer">
    <div className="bg-white p-6 rounded-xl border border-muted flex flex-col items-center justify-center text-center space-y-3 transition-transform hover:scale-[1.02] hover:border-brand/30">
      <Icon className="h-10 w-10 text-brand" />
      <h3 className="font-heading font-semibold text-slate-700">{title}</h3>
    </div>
  </Link>
);

// Componente para o item da lista de agendamentos
const AgendamentoItem = ({ agendamento }: { agendamento: AgendamentoComPaciente }) => {
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return <span className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> {status}</span>;
      case 'PENDENTE':
        return <span className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800"><Hourglass className="h-3 w-3 mr-1" /> {status}</span>;
      case 'CANCELADO':
        return <span className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" /> {status}</span>;
      default:
        return <span className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <li className="border-b last:border-b-0 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 mb-2 sm:mb-0">
        <p className="font-semibold text-gray-800">{agendamento.user.name}</p>
        <p className="text-sm text-gray-500">
          {format(new Date(agendamento.dataHora), "HH:mm", { locale: ptBR })} - {format(new Date(agendamento.dataHora), "eeee, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>
      <div className="flex items-center">
        {getStatusChip(agendamento.status)}
      </div>
    </li>
  );
};


export default function AdminDashboard() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalHoje: 0, confirmados: 0, pendentes: 0 });

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const response = await fetch('/api/admin/agendamentos?range=day');
        if (!response.ok) throw new Error('Falha ao buscar agendamentos do dia');
        const data: AgendamentoComPaciente[] = await response.json();

        const formattedData = data.map((item) => ({
          ...item,
          user: (item as any).paciente || item.user,
        }));

        setAgendamentos(formattedData);
        setStats({
          totalHoje: formattedData.length,
          confirmados: formattedData.filter((a) => a.status === 'CONFIRMADO').length,
          pendentes: formattedData.filter((a) => a.status === 'PENDENTE').length,
        });
      } catch {
        const { mockAgendamentosAdmin } = await import('@/lib/fixtures');
        const formattedData = mockAgendamentosAdmin.map((item) => ({
          ...(item as any),
          user: { name: item.pacienteNome, email: item.pacienteEmail },
        })) as AgendamentoComPaciente[];
        setAgendamentos(formattedData);
        setStats({
          totalHoje: formattedData.length,
          confirmados: formattedData.filter((a) => a.status === 'CONFIRMADO').length,
          pendentes: formattedData.filter((a) => a.status === 'PENDENTE').length,
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, []);

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-ink">Painel Administrativo</h1>
          <p className="text-md text-slate-600 mt-1">Bem-vinda de volta! Gerencie agendamentos e pacientes.</p>
        </header>

        {/* Seção de Estatísticas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Agendamentos Hoje" value={loading ? '...' : stats.totalHoje} icon={Calendar} />
          <StatCard title="Confirmados Hoje" value={loading ? '...' : stats.confirmados} icon={CheckCircle2} color="text-green-600" />
          <StatCard title="Pendentes Hoje" value={loading ? '...' : stats.pendentes} icon={Hourglass} color="text-yellow-600" />
        </section>

        {/* Seção de Ações Rápidas */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <ActionCard title="Gerenciar Agendamentos" href="/admin/agendamentos" icon={Calendar} />
            <ActionCard title="Gerenciar Pacientes" href="/admin/pacientes" icon={Users} />
            <ActionCard title="Definir Disponibilidade" href="/admin/disponibilidade" icon={Clock} />
            <ActionCard title="Ver Relatórios" href="#" icon={BarChart2} />
        </section>

        {/* Seção de Próximos Agendamentos */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Agendamentos do Dia</h2>
          {loading ? (
            <div className="flex justify-center items-center min-h-[120px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
          ) : error ? (
            <p className="text-red-500 flex items-center"><AlertCircle className="mr-2"/> {error}</p>
          ) : agendamentos.length > 0 ? (
            <ul className="space-y-2">
              {agendamentos.map(agendamento => (
                <AgendamentoItem key={agendamento.id} agendamento={agendamento} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum agendamento para hoje.</p>
          )}
        </section>
      </div>
    </div>
  );
}