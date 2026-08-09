/**
 * Dados server-side para modo demo (sem Supabase).
 */
import { addDays, subDays, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { demoUsers } from '@/lib/demo-auth';

const now = new Date();
const pacienteId = demoUsers.PACIENTE.id;
const adminId = demoUsers.ADMIN.id;

export const demoUsers_db = [
  {
    id: pacienteId,
    name: demoUsers.PACIENTE.name,
    email: demoUsers.PACIENTE.email,
    cpf: demoUsers.PACIENTE.cpf,
    telefone: demoUsers.PACIENTE.telefone,
    role: 'PACIENTE',
    valorConsulta: 250,
  },
  {
    id: adminId,
    name: demoUsers.ADMIN.name,
    email: demoUsers.ADMIN.email,
    cpf: demoUsers.ADMIN.cpf,
    telefone: demoUsers.ADMIN.telefone,
    role: 'ADMIN',
    valorConsulta: 250,
  },
  {
    id: 'p2',
    name: 'João Costa',
    email: 'joao@agendapsi.demo',
    cpf: '222.222.222-22',
    telefone: '(11) 97777-0000',
    role: 'PACIENTE',
    valorConsulta: 250,
  },
  {
    id: 'p3',
    name: 'Ana Paula',
    email: 'ana@agendapsi.demo',
    cpf: '333.333.333-33',
    telefone: '(11) 96666-0000',
    role: 'PACIENTE',
    valorConsulta: 250,
  },
];

export const demoAgendamentos = [
  {
    id: 'a1',
    dataHora: addDays(now, 3).toISOString(),
    status: 'CONFIRMADO',
    motivoConsulta: 'Consulta de retorno',
    patientId: pacienteId,
    protocolCode: 'DEMO-001',
    createdAt: subDays(now, 5).toISOString(),
    updatedAt: now.toISOString(),
    faturaId: null,
  },
  {
    id: 'a2',
    dataHora: addDays(now, 10).toISOString(),
    status: 'PENDENTE',
    motivoConsulta: 'Pré-agendamento demo',
    patientId: pacienteId,
    protocolCode: 'DEMO-002',
    createdAt: subDays(now, 1).toISOString(),
    updatedAt: now.toISOString(),
    faturaId: null,
  },
  {
    id: 'a3',
    dataHora: subDays(now, 7).toISOString(),
    status: 'REALIZADO',
    motivoConsulta: 'Sessão concluída',
    patientId: pacienteId,
    protocolCode: 'DEMO-003',
    createdAt: subDays(now, 14).toISOString(),
    updatedAt: subDays(now, 7).toISOString(),
    faturaId: 'f1',
  },
  {
    id: 'a4',
    dataHora: addDays(now, 1).toISOString(),
    status: 'CONFIRMADO',
    motivoConsulta: 'Primeira consulta',
    patientId: 'p2',
    protocolCode: 'DEMO-004',
    createdAt: subDays(now, 3).toISOString(),
    updatedAt: now.toISOString(),
    faturaId: null,
  },
  {
    id: 'a5',
    dataHora: addDays(now, 2).toISOString(),
    status: 'PENDENTE',
    motivoConsulta: 'Acompanhamento',
    patientId: 'p3',
    protocolCode: 'DEMO-005',
    createdAt: subDays(now, 2).toISOString(),
    updatedAt: now.toISOString(),
    faturaId: null,
  },
];

export const demoFaturas = [
  {
    id: 'f1',
    userId: pacienteId,
    status: 'PAGO',
    dataVencimento: subDays(now, 15).toISOString(),
    dataPagamento: subDays(now, 14).toISOString(),
    valorTotal: 250,
    quantidadeConsultas: 1,
    itens: [{ agendamentoId: 'a3', data: subDays(now, 7).toISOString(), valor: 250, descricao: 'Consulta' }],
    observacao: 'Pagamento via PIX (demo)',
    createdAt: subDays(now, 20).toISOString(),
    updatedAt: subDays(now, 14).toISOString(),
    user: demoUsers_db[0],
  },
  {
    id: 'f2',
    userId: pacienteId,
    status: 'PENDENTE',
    dataVencimento: addDays(now, 10).toISOString(),
    dataPagamento: null,
    valorTotal: 250,
    quantidadeConsultas: 1,
    itens: [{ agendamentoId: 'a1', data: addDays(now, 3).toISOString(), valor: 250, descricao: 'Consulta' }],
    observacao: null,
    createdAt: subDays(now, 2).toISOString(),
    updatedAt: subDays(now, 2).toISOString(),
    user: demoUsers_db[0],
  },
];

export const demoNotificacoes = [
  {
    id: 'n1',
    tipo: 'SISTEMA',
    mensagem: 'Sua consulta de demonstração foi confirmada.',
    lida: false,
    linkRedirecionamento: '/portal/paciente/agendamentos',
    dataCriacao: now.toISOString(),
    userId: pacienteId,
  },
  {
    id: 'n2',
    tipo: 'FINANCEIRO',
    mensagem: 'Nova fatura FAT-2026-002 disponível no financeiro.',
    lida: true,
    linkRedirecionamento: '/portal/paciente/financeiro',
    dataCriacao: subDays(now, 1).toISOString(),
    userId: pacienteId,
  },
];

export const demoDocumentos = [
  {
    id: 'd1',
    userId: pacienteId,
    token: 'demo-token-consentimento',
    expiresAt: addDays(now, 30).toISOString(),
    tipoDocumento: 'TERMO_CONSENTIMENTO',
    conteudoHtml: '<p>Termo de consentimento para atendimento psicológico (demonstração).</p>',
    assinado: false,
    assinadoEm: null,
    createdAt: subDays(now, 3).toISOString(),
    updatedAt: subDays(now, 3).toISOString(),
  },
  {
    id: 'd2',
    userId: pacienteId,
    token: 'demo-token-contrato',
    expiresAt: addDays(now, 60).toISOString(),
    tipoDocumento: 'CONTRATO',
    conteudoHtml: '<p>Contrato de prestação de serviços (demonstração).</p>',
    assinado: true,
    assinadoEm: subDays(now, 30).toISOString(),
    createdAt: subDays(now, 30).toISOString(),
    updatedAt: subDays(now, 30).toISOString(),
  },
];

export const demoAuditLogs = [
  {
    id: 'log1',
    acao: 'CRIAR',
    entidade: 'Agendamento',
    entidadeId: 'a2',
    descricao: 'Pré-agendamento criado via portal (demo)',
    autorId: pacienteId,
    autorNome: demoUsers.PACIENTE.name,
    autorTipo: 'PACIENTE',
    ip: '127.0.0.1',
    createdAt: subDays(now, 1).toISOString(),
  },
  {
    id: 'log2',
    acao: 'CONFIRMAR',
    entidade: 'Agendamento',
    entidadeId: 'a1',
    descricao: 'Consulta confirmada pela profissional (demo)',
    autorId: adminId,
    autorNome: demoUsers.ADMIN.name,
    autorTipo: 'ADMIN',
    ip: '127.0.0.1',
    createdAt: subDays(now, 2).toISOString(),
  },
  {
    id: 'log3',
    acao: 'PAGAR',
    entidade: 'Fatura',
    entidadeId: 'f1',
    descricao: 'Fatura marcada como paga (demo)',
    autorId: adminId,
    autorNome: demoUsers.ADMIN.name,
    autorTipo: 'ADMIN',
    ip: null,
    createdAt: subDays(now, 14).toISOString(),
  },
];

export const demoBookableSlots = Array.from({ length: 8 }, (_, i) => {
  const d = addDays(now, i + 1);
  d.setHours(9 + (i % 4) * 2, 0, 0, 0);
  return {
    id: `slot-${i}`,
    startTime: d.toISOString(),
    endTime: new Date(d.getTime() + 50 * 60000).toISOString(),
    isBooked: false,
    userId: adminId,
  };
});

export function buildRelatorioMensal(ref: Date = now) {
  const inicioMes = startOfMonth(ref);
  const fimMes = endOfMonth(ref);
  const ags = demoAgendamentos.filter((a) => {
    const d = new Date(a.dataHora);
    return d >= inicioMes && d <= fimMes;
  });

  const historico6Meses = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(ref, 5 - i);
    return {
      mes: format(d, 'MMM/yy', { locale: ptBR }),
      chave: format(d, 'yyyy-MM'),
      recebido: i === 4 ? 250 : i === 5 ? 0 : 200 + i * 25,
      pendente: i === 5 ? 250 : 0,
      total: 3 + (i % 3),
      realizadas: 2 + (i % 2),
      faltas: i % 4 === 0 ? 1 : 0,
      canceladas: i % 5 === 0 ? 1 : 0,
    };
  });

  return {
    mesChave: format(ref, 'yyyy-MM'),
    mesLabel: format(ref, "MMMM 'de' yyyy", { locale: ptBR }),
    totalAgendamentos: ags.length,
    realizadas: ags.filter((a) => a.status === 'REALIZADO').length,
    canceladas: ags.filter((a) => a.status === 'CANCELADO').length,
    faltas: ags.filter((a) => a.status === 'NAO_COMPARECEU').length,
    confirmadas: ags.filter((a) => a.status === 'CONFIRMADO').length,
    pendentes: ags.filter((a) => a.status === 'PENDENTE').length,
    receitaRecebida: demoFaturas.filter((f) => f.status === 'PAGO').reduce((s, f) => s + f.valorTotal, 0),
    receitaPendente: demoFaturas.filter((f) => f.status === 'PENDENTE').reduce((s, f) => s + f.valorTotal, 0),
    historico6Meses,
  };
}

export function buildRelatorioAnual(ano: number = now.getFullYear()) {
  return {
    ano,
    totalAgendamentos: demoAgendamentos.length * 2,
    realizadas: 18,
    canceladas: 2,
    faltas: 1,
    receitaTotal: 4500,
    receitaRecebida: 4000,
    receitaPendente: 500,
    meses: Array.from({ length: 12 }, (_, i) => ({
      mes: format(new Date(ano, i, 1), 'MMM', { locale: ptBR }),
      chave: `${ano}-${String(i + 1).padStart(2, '0')}`,
      total: 3 + (i % 4),
      recebido: 300 + i * 20,
      pendente: i % 3 === 0 ? 100 : 0,
    })),
  };
}
