/**
 * Fixtures client-side para demo quando APIs falham / sem backend.
 */

export const mockAgendamentosPaciente = [
  {
    id: 'a1',
    dataHora: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CONFIRMADO',
    observacoes: 'Consulta de retorno — demonstração',
    tipo: 'ONLINE',
  },
  {
    id: 'a2',
    dataHora: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    observacoes: 'Pré-agendamento demo',
    tipo: 'PRESENCIAL',
  },
  {
    id: 'a3',
    dataHora: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'REALIZADA',
    observacoes: 'Sessão concluída (mock)',
    tipo: 'ONLINE',
  },
];

export const mockAgendamentosAdmin = [
  {
    id: 'adm1',
    dataHora: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CONFIRMADO',
    pacienteNome: 'Maria Silva',
    pacienteEmail: 'paciente@agendapsi.demo',
  },
  {
    id: 'adm2',
    dataHora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    pacienteNome: 'João Costa',
    pacienteEmail: 'joao@agendapsi.demo',
  },
  {
    id: 'adm3',
    dataHora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'REALIZADA',
    pacienteNome: 'Ana Paula',
    pacienteEmail: 'ana@agendapsi.demo',
  },
];

export const mockFaturas = [
  {
    id: 'f1',
    numero: 'FAT-2026-001',
    valor: 250,
    status: 'PAGO',
    competencia: '2026-07',
    emitidaEm: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f2',
    numero: 'FAT-2026-002',
    valor: 250,
    status: 'PENDENTE',
    competencia: '2026-08',
    emitidaEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockNotificacoes = [
  {
    id: 'n1',
    titulo: 'Consulta confirmada',
    mensagem: 'Sua consulta de demonstração foi confirmada.',
    lida: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    titulo: 'Nova fatura disponível',
    mensagem: 'A fatura FAT-2026-002 está disponível no financeiro.',
    lida: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockDocumentos = [
  {
    id: 'd1',
    titulo: 'Termo de consentimento (demo)',
    status: 'PENDENTE_ASSINATURA',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'd2',
    titulo: 'Contrato de atendimento',
    status: 'ASSINADO',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];
