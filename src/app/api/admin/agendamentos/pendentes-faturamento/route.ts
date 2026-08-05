import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/agendamentos/pendentes-faturamento?pacienteId=xxx
// Lista agendamentos REALIZADO ou NAO_COMPARECEU que ainda não foram vinculados a nenhuma fatura.
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get('pacienteId');
  if (!pacienteId) {
    return NextResponse.json({ error: 'pacienteId é obrigatório.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('Agendamento')
      .select('id, dataHora, status')
      .eq('patientId', pacienteId)
      .in('status', ['REALIZADO', 'NAO_COMPARECEU'])
      .is('faturaId', null)
      .order('dataHora', { ascending: true });
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error('[PENDENTES-FATURAMENTO] Erro:', err);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos pendentes de faturamento.' }, { status: 500 });
  }
}
