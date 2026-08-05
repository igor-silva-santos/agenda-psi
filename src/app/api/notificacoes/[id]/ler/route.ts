import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const { data: notificacao, error: fetchError } = await supabase
      .from('Notificacao')
      .select('id, userId')
      .eq('id', params.id)
      .single();

    if (fetchError || !notificacao || notificacao.userId !== session.user.id) {
      return NextResponse.json({ message: 'Notificação não encontrada.' }, { status: 404 });
    }

    const { error } = await supabase
      .from('Notificacao')
      .update({ lida: true })
      .eq('id', params.id);
    if (error) throw error;

    return NextResponse.json({ message: 'Notificação marcada como lida.' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
