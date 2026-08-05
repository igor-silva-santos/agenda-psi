import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAuditoria, getIpFromRequest } from '@/lib/audit';
import { criarNotificacao } from '@/lib/notificacao';

const ALLOWED = ['RASCUNHO', 'PENDENTE', 'PAGO', 'CANCELADO'];

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const { status } = await request.json();
    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: `Status "${status}" inválido.` }, { status: 400 });
    }

    const { data: fatura, error: fetchError } = await supabase
      .from('Fatura')
      .select('id, userId, valorTotal, status')
      .eq('id', params.id)
      .single();
    if (fetchError || !fatura) {
      return NextResponse.json({ error: 'Fatura não encontrada.' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
    if (status === 'PAGO') updates.dataPagamento = new Date().toISOString();

    // Se a fatura for cancelada, libera as consultas para poderem ser re-faturadas
    if (status === 'CANCELADO') {
      await supabase.from('Agendamento').update({ faturaId: null }).eq('faturaId', params.id);
    }

    const { data: updated, error: updateError } = await supabase
      .from('Fatura')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();
    if (updateError || !updated) throw updateError;

    criarNotificacao({
      userId: fatura.userId,
      tipo: 'FINANCEIRO',
      mensagem: status === 'PAGO'
        ? `Recebemos a confirmação de pagamento da sua fatura de R$ ${fatura.valorTotal.toFixed(2)}.`
        : `O status da sua fatura de R$ ${fatura.valorTotal.toFixed(2)} foi atualizado para ${status}.`,
      linkRedirecionamento: '/portal/paciente/financeiro',
    });

    logAuditoria({
      acao: status === 'PAGO' ? 'PAGAR' : status === 'CANCELADO' ? 'CANCELAR' : 'ATUALIZAR',
      entidade: 'Fatura',
      entidadeId: params.id,
      descricao: `Status da fatura alterado de ${fatura.status} para ${status}`,
      autorId: session.user.id,
      autorNome: session.user.name ?? null,
      autorTipo: 'ADMIN',
      ip: getIpFromRequest(request),
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[FATURAS][STATUS] Erro:', err);
    return NextResponse.json({ error: 'Erro ao atualizar status da fatura.' }, { status: 500 });
  }
}
