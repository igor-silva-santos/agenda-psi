import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('Notificacao')
      .update({ lida: true })
      .eq('userId', session.user.id)
      .eq('lida', false);
    if (error) throw error;

    return NextResponse.json({ message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
