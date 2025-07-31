import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays, setHours, setMinutes, isBefore, isAfter, isEqual, format, parse } from 'date-fns';
import { getToken } from 'next-auth/jwt';

export async function POST(request: Request) {
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
    .eq('id', token.id)
    .single();
  if (userError || !user || user.currentSessionId !== token.sessionId) {
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ 
      error: "Unauthorized",
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  const { startDateTime, endDateTime } = await request.json();

  try {
    const { data: newSlot, error: createError } = await supabase
      .from('BookableSlot')
      .insert([
        {
          startDateTime: new Date(startDateTime),
          endDateTime: new Date(endDateTime),
        },
      ])
      .select()
      .single();
    if (createError) throw createError;
    return NextResponse.json(newSlot);
  } catch (error) {
    console.error("Error creating bookable slot:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all');

  // NOVA LÓGICA: gerar slots dinâmicos de 1h para os próximos 30 dias
  try {
    // 1. Buscar horários de atuação padrão
    const { data: horariosAtuacao, error: atuacaoError } = await supabase
      .from('HorarioAtuacao')
      .select('*');
    if (atuacaoError || !horariosAtuacao || horariosAtuacao.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Buscar horários já agendados (slots já ocupados)
    const { data: agendamentos, error: agendamentoError } = await supabase
      .from('Agendamento')
      .select('dataHora, status')
      .gte('dataHora', new Date().toISOString());
    if (agendamentoError) throw agendamentoError;
    const agendadosSet = new Set((agendamentos || []).filter(a => a.status !== 'CANCELADO').map(a => new Date(a.dataHora).toISOString()));

    // 3. Buscar períodos bloqueados
    const { data: bloqueios, error: bloqueioError } = await supabase
      .from('HorarioBloqueado')
      .select('*')
      .gte('dataHoraFim', new Date().toISOString());
    if (bloqueioError) throw bloqueioError;

    // 4. Gerar slots de 1h para os próximos 180 dias (6 meses)
    const slots: any[] = [];
    const now = new Date();
    for (let i = 0; i < 180; i++) {
      const dia = addDays(now, i);
      const diaSemana = dia.getDay();
      const atuacoesDoDia = horariosAtuacao.filter(h => h.diaDaSemana === diaSemana);
      for (const atuacao of atuacoesDoDia) {
        let [hIni, mIni] = atuacao.horaInicio.split(':').map(Number);
        let [hFim, mFim] = atuacao.horaFim.split(':').map(Number);
        let almocoIni = atuacao.almocoInicio ? atuacao.almocoInicio.split(':').map(Number) : null;
        let almocoFim = atuacao.almocoFim ? atuacao.almocoFim.split(':').map(Number) : null;
        let slotStart = setMinutes(setHours(new Date(dia), hIni), mIni);
        const slotEndLimit = setMinutes(setHours(new Date(dia), hFim), mFim);
        while (isBefore(slotStart, slotEndLimit)) {
          let slotEnd = addDays(slotStart, 0);
          slotEnd.setHours(slotStart.getHours() + 1, slotStart.getMinutes(), 0, 0);
          if (isAfter(slotEnd, slotEndLimit)) break;

          // Pular se estiver no horário de almoço
          if (almocoIni && almocoFim) {
            const almocoStart = setMinutes(setHours(new Date(dia), almocoIni[0]), almocoIni[1]);
            const almocoEnd = setMinutes(setHours(new Date(dia), almocoFim[0]), almocoFim[1]);
            if (
              (slotStart >= almocoStart && slotStart < almocoEnd) ||
              (slotEnd > almocoStart && slotEnd <= almocoEnd) ||
              (slotStart <= almocoStart && slotEnd >= almocoEnd)
            ) {
              slotStart = slotEnd;
              continue;
            }
          }

          // Pular se estiver em período bloqueado
          const isBlocked = (bloqueios || []).some(b =>
            (slotStart >= new Date(b.dataHoraInicio) && slotStart < new Date(b.dataHoraFim)) ||
            (slotEnd > new Date(b.dataHoraInicio) && slotEnd <= new Date(b.dataHoraFim))
          );
          if (isBlocked) {
            slotStart = slotEnd;
            continue;
          }

          // Pular se já agendado
          if (agendadosSet.has(slotStart.toISOString())) {
            slotStart = slotEnd;
            continue;
          }

          slots.push({
            id: slotStart.getTime(),
            startDateTime: slotStart,
            endDateTime: slotEnd,
            isBooked: false,
          });
          slotStart = slotEnd;
        }
      }
    }
    slots.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching/generating bookable slots:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}