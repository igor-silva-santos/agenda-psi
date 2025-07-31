import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';

const perfilSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  image: z.string().url('URL da imagem inválida').optional(),
});

export async function GET(request: Request) {
  console.log('[PORTAL-PERFIL][GET] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PORTAL-PERFIL][GET] Token ausente');
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Token ausente' }
    }, { status: 401 });
  }
  const { data: user, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (error || !user || user.currentSessionId !== token.sessionId) {
    console.warn('[PORTAL-PERFIL][GET] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  try {
    return NextResponse.json(user);
  } catch (error) {
    console.error('[PORTAL-PERFIL][GET] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao buscar perfil',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  console.log('[PORTAL-PERFIL][PUT] Início da requisição');
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.warn('[PORTAL-PERFIL][PUT] Token ausente');
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Token ausente' }
    }, { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    console.warn('[PORTAL-PERFIL][PUT] Sessão concorrente detectada ou usuário não encontrado', { user, token });
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  try {
    const data = await request.json();
    const { data: updated, error: updateError } = await supabase
      .from('User')
      .update(data)
      .eq('id', token.id)
      .select('*')
      .single();
    if (updateError) throw updateError;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PORTAL-PERFIL][PUT] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao atualizar perfil',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}