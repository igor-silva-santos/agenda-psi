import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { data: agendamentos, error } = await supabase
      .from('Agendamento')
      .select('id, dataHora, status, motivoConsulta')
      .eq('userId', session.user.id)
      .order('dataHora', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    const activities = agendamentos.map(a => {
      let action = 'Ação desconhecida';
      switch (a.status) {
        case 'PENDENTE':
          action = 'Pré-Agendamento Criado';
          break;
        case 'CONFIRMADO':
          action = 'Consulta Confirmada';
          break;
        case 'CANCELADO':
          action = 'Consulta Cancelada';
          break;
        case 'REALIZADO':
           action = 'Consulta Realizada';
           break;
      }
      return {
        id: a.id,
        action: action,
        timestamp: a.dataHora,
        details: `Consulta para ${new Date(a.dataHora).toLocaleDateString('pt-BR')}`,
      };
    });

    return NextResponse.json(activities);

  } catch (error) {
    console.error('[API/ACTIVITY] Error fetching activities:', error);
    return NextResponse.json({ error: 'Erro ao buscar atividades.' }, { status: 500 });
  }
}
