import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { addDays } from 'date-fns';
import { logAuditoria, getIpFromRequest } from '@/lib/audit';
import { criarNotificacao } from '@/lib/notificacao';

// GET — lista documentos de um paciente
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }
  try {
    const { data, error } = await supabase
      .from('Documento')
      .select('*')
      .eq('userId', params.id)
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[DOCUMENTO][GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao buscar documentos.' }, { status: 500 });
  }
}

// POST — cria um novo documento para assinatura e gera o link/token
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const { tipoDocumento, conteudoHtml } = await request.json();
    if (!tipoDocumento || !conteudoHtml) {
      return NextResponse.json({ error: 'tipoDocumento e conteudoHtml são obrigatórios.' }, { status: 400 });
    }

    const { data: paciente } = await supabase.from('User').select('id, name').eq('id', params.id).single();
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 });
    }

    const { data: documento, error } = await supabase
      .from('Documento')
      .insert({
        userId: params.id,
        tipoDocumento,
        conteudoHtml,
        expiresAt: addDays(new Date(), 7).toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !documento) throw error;

    criarNotificacao({
      userId: params.id,
      tipo: 'DOCUMENTO',
      mensagem: `Você tem um novo documento (${tipoDocumento}) para assinar.`,
      linkRedirecionamento: `/documento/${documento.token}`,
    });

    logAuditoria({
      acao: 'CRIAR',
      entidade: 'Documento',
      entidadeId: documento.id,
      descricao: `Documento "${tipoDocumento}" enviado para assinatura de ${paciente.name}`,
      autorId: session.user.id,
      autorNome: session.user.name ?? null,
      autorTipo: 'ADMIN',
      ip: getIpFromRequest(request),
    });

    return NextResponse.json(documento, { status: 201 });
  } catch (err: any) {
    console.error('[DOCUMENTO][POST] Erro:', err);
    return NextResponse.json({ error: 'Erro ao criar documento.', details: err?.message }, { status: 500 });
  }
}
