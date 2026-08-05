// src/lib/notificacao.ts
// Helper para criar notificações para o paciente. Fire-and-forget.

import { supabase } from '@/lib/supabase';

export type TipoNotificacao = 'FINANCEIRO' | 'RECOMENDACAO' | 'DOCUMENTO' | 'SISTEMA';

export interface CriarNotificacaoParams {
  userId: string;
  tipo: TipoNotificacao;
  mensagem: string;
  linkRedirecionamento?: string | null;
}

export async function criarNotificacao(params: CriarNotificacaoParams): Promise<void> {
  try {
    const { error } = await supabase.from('Notificacao').insert({
      userId: params.userId,
      tipo: params.tipo,
      mensagem: params.mensagem,
      linkRedirecionamento: params.linkRedirecionamento ?? null,
    });
    if (error) throw error;
  } catch (err) {
    console.error('[Notificacao] Falha ao criar:', err);
  }
}
