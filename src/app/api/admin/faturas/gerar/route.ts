import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { logAuditoria, getIpFromRequest } from '@/lib/audit';
import { criarNotificacao } from '@/lib/notificacao';

const gerarFaturaSchema = z.object({
  pacienteId: z.string().uuid('ID do paciente inválido.'),
  agendamentoIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos uma consulta.'),
  dataVencimento: z.string().min(1, 'Data de vencimento é obrigatória.'),
  observacao: z.string().optional(),
});

// POST /api/admin/faturas/gerar — cria uma fatura a partir de consultas já realizadas
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = gerarFaturaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos.', details: validation.error.flatten() }, { status: 400 });
    }
    const { pacienteId, agendamentoIds, dataVencimento, observacao } = validation.data;

    const { data: paciente, error: pacienteError } = await supabase
      .from('User')
      .select('id, name, valorConsulta')
      .eq('id', pacienteId)
      .single();
    if (pacienteError || !paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 });
    }

    const { data: agendamentos, error: agsError } = await supabase
      .from('Agendamento')
      .select('id, dataHora, status, faturaId')
      .in('id', agendamentoIds)
      .eq('patientId', pacienteId);
    if (agsError) throw agsError;

    if (!agendamentos || agendamentos.length !== agendamentoIds.length) {
      return NextResponse.json({ error: 'Algumas consultas não foram encontradas ou não pertencem a este paciente.' }, { status: 404 });
    }
    if (agendamentos.some(a => a.faturaId)) {
      return NextResponse.json({ error: 'Uma ou mais consultas selecionadas já pertencem a outra fatura.' }, { status: 409 });
    }

    const valorConsulta = paciente.valorConsulta || 150;
    const itens = agendamentos.map(a => ({
      agendamentoId: a.id,
      data: new Date(a.dataHora).toLocaleString('pt-BR'),
      status: a.status,
      valor: valorConsulta,
    }));
    const valorTotal = itens.reduce((s, i) => s + i.valor, 0);

    const { data: fatura, error: faturaError } = await supabase
      .from('Fatura')
      .insert({
        userId: pacienteId,
        status: 'PENDENTE',
        dataVencimento: new Date(dataVencimento).toISOString(),
        valorTotal,
        quantidadeConsultas: itens.length,
        itens,
        observacao: observacao || null,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (faturaError || !fatura) throw faturaError;

    const { error: linkError } = await supabase
      .from('Agendamento')
      .update({ faturaId: fatura.id })
      .in('id', agendamentoIds);
    if (linkError) throw linkError;

    criarNotificacao({
      userId: pacienteId,
      tipo: 'FINANCEIRO',
      mensagem: `Uma nova fatura de R$ ${valorTotal.toFixed(2)} foi gerada para você.`,
      linkRedirecionamento: '/portal/paciente/financeiro',
    });

    logAuditoria({
      acao: 'CRIAR',
      entidade: 'Fatura',
      entidadeId: fatura.id,
      descricao: `Fatura de R$ ${valorTotal.toFixed(2)} gerada para ${paciente.name} (${itens.length} consulta(s))`,
      autorId: session.user.id,
      autorNome: session.user.name ?? null,
      autorTipo: 'ADMIN',
      ip: getIpFromRequest(request),
    });

    return NextResponse.json(fatura, { status: 201 });
  } catch (err: any) {
    console.error('[FATURAS][GERAR] Erro:', err);
    return NextResponse.json({ error: 'Erro ao gerar fatura.', details: err?.message }, { status: 500 });
  }
}
