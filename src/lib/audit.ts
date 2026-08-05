// src/lib/audit.ts
// Helper de auditoria — registra ações relevantes do sistema (admin e automáticas).
// Fire-and-forget: nunca lança exceção para não interromper o fluxo principal.

import { supabase } from '@/lib/supabase';

export type AcaoAuditoria =
  | 'CRIAR'
  | 'ATUALIZAR'
  | 'DELETAR'
  | 'CANCELAR'
  | 'PAGAR'
  | 'ENVIAR'
  | 'ASSINAR'
  | 'CONFIRMAR'
  | 'SISTEMA';

export type EntidadeAuditoria =
  | 'Usuario'
  | 'Agendamento'
  | 'Fatura'
  | 'Documento'
  | 'Prontuario'
  | 'HorarioBloqueado';

export type AutorTipo = 'ADMIN' | 'PACIENTE' | 'SISTEMA';

export interface LogAuditoriaParams {
  acao: AcaoAuditoria;
  entidade: EntidadeAuditoria;
  entidadeId?: string | null;
  descricao: string;
  dadosAntes?: Record<string, unknown> | null;
  dadosDepois?: Record<string, unknown> | null;
  autorId?: string | null;
  autorNome?: string | null;
  autorTipo?: AutorTipo;
  ip?: string | null;
}

/**
 * Registra uma entrada de auditoria. Nunca lança exceção — falhas são apenas logadas.
 */
export async function logAuditoria(params: LogAuditoriaParams): Promise<void> {
  try {
    const { error } = await supabase.from('AuditLog').insert({
      acao: params.acao,
      entidade: params.entidade,
      entidadeId: params.entidadeId ?? null,
      descricao: params.descricao,
      dadosAntes: params.dadosAntes ?? null,
      dadosDepois: params.dadosDepois ?? null,
      autorId: params.autorId ?? null,
      autorNome: params.autorNome ?? null,
      autorTipo: params.autorTipo ?? 'ADMIN',
      ip: params.ip ?? null,
    });
    if (error) throw error;
  } catch (err) {
    // Nunca interrompe o fluxo principal
    console.error('[AuditLog] Falha ao registrar:', err);
  }
}

/**
 * Extrai IP do cliente a partir dos headers da requisição.
 */
export function getIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return request.headers.get('x-real-ip') ?? null;
}
