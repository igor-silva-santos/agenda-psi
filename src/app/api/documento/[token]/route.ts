import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET público — carrega os dados do documento para exibição na página de assinatura
export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const { data: documento, error } = await supabase
      .from('Documento')
      .select('*, user:User(name)')
      .eq('token', params.token)
      .single();

    if (error || !documento) {
      return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 });
    }

    if (documento.assinado) {
      return NextResponse.json({ error: 'Este documento já foi assinado.', jaAssinado: true }, { status: 410 });
    }

    if (new Date(documento.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Este link expirou. Solicite um novo link.', expirado: true }, { status: 410 });
    }

    return NextResponse.json({
      id: documento.id,
      tipoDocumento: documento.tipoDocumento,
      conteudoHtml: documento.conteudoHtml,
      nomePaciente: documento.user?.name || '',
      expiresAt: documento.expiresAt,
    });
  } catch (err) {
    console.error('[DOCUMENTO][TOKEN][GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao carregar documento.' }, { status: 500 });
  }
}
