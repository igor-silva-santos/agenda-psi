import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { logAuditoria, getIpFromRequest } from '@/lib/audit';
import { criarNotificacao } from '@/lib/notificacao';

// POST público — registra a assinatura do documento
export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const { cpf, imagemAssinatura } = await request.json();

    const cpfLimpo = String(cpf || '').replace(/\D/g, '');
    if (!cpfValidator.isValid(cpfLimpo)) {
      return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 });
    }
    if (!imagemAssinatura) {
      return NextResponse.json({ error: 'Assinatura é obrigatória.' }, { status: 400 });
    }

    const { data: documento, error: fetchError } = await supabase
      .from('Documento')
      .select('*, user:User(id, name, cpf)')
      .eq('token', params.token)
      .single();

    if (fetchError || !documento) {
      return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 });
    }
    if (documento.assinado) {
      return NextResponse.json({ error: 'Este documento já foi assinado.', jaAssinado: true }, { status: 410 });
    }
    if (new Date(documento.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Este link expirou.', expirado: true }, { status: 410 });
    }

    if (documento.user?.cpf && documento.user.cpf.replace(/\D/g, '') !== cpfLimpo) {
      return NextResponse.json({ error: 'CPF informado não confere com o cadastro.' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('Documento')
      .update({
        assinado: true,
        assinadoEm: new Date().toISOString(),
        ipAssinatura: getIpFromRequest(request),
        cpfConfirmado: cpfLimpo,
        imagemAssinatura,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', documento.id);
    if (updateError) throw updateError;

    criarNotificacao({
      userId: documento.userId,
      tipo: 'DOCUMENTO',
      mensagem: `Sua assinatura do documento "${documento.tipoDocumento}" foi registrada com sucesso.`,
      linkRedirecionamento: '/portal/paciente/meus-documentos',
    });

    logAuditoria({
      acao: 'ASSINAR',
      entidade: 'Documento',
      entidadeId: documento.id,
      descricao: `Documento "${documento.tipoDocumento}" assinado por ${documento.user?.name ?? 'paciente'}`,
      autorId: documento.userId,
      autorNome: documento.user?.name ?? null,
      autorTipo: 'PACIENTE',
      ip: getIpFromRequest(request),
    });

    return NextResponse.json({ message: 'Documento assinado com sucesso.' });
  } catch (err: any) {
    console.error('[DOCUMENTO][ASSINAR] Erro:', err);
    return NextResponse.json({ error: 'Erro ao registrar assinatura.', details: err?.message }, { status: 500 });
  }
}
