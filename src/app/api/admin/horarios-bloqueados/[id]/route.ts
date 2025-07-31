import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Token ausente' }
    }, { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', Number(token.id))
    .single();
  if (!user || user.currentSessionId !== token.sessionId) {
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  const { id } = params;

  try {
    const { error: deleteError } = await supabase
      .from('HorarioBloqueado')
      .delete()
      .eq('id', id);
    if (deleteError) {
      throw deleteError;
    }
    return NextResponse.json({ message: 'Horário bloqueado deletado com sucesso' }, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar o horário bloqueado ${id}:`, error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}