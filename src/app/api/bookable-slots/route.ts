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
      .neq('status', 'CANCELADO');
    if (agendamentoError) throw agendamentoError;

    const agendadosTimestamps = new Set((agendamentos || []).map(a => {
      const date = new Date(a.dataHora);
      date.setMilliseconds(0);
      return date.getTime();
    }));

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
      const dia = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
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
          const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
          if (isAfter(slotEnd, slotEndLimit)) break;

          let isAvailable = true;

          // Checar horário de almoço
          if (almocoIni && almocoFim) {
            const almocoStart = setMinutes(setHours(new Date(dia), almocoIni[0]), almocoIni[1]);
            const almocoEnd = setMinutes(setHours(new Date(dia), almocoFim[0]), almocoFim[1]);
            if (slotStart < almocoEnd && almocoStart < slotEnd) {
              isAvailable = false;
            }
          }

          // Checar período bloqueado
          if (isAvailable) {
            const isBlocked = (bloqueios || []).some(b => {
              const blockedStart = new Date(b.dataHoraInicio);
              const blockedEnd = new Date(b.dataHoraFim);
              return slotStart < blockedEnd && blockedStart < slotEnd;
            });
            if (isBlocked) {
              isAvailable = false;
            }
          }

          // Checar se já agendado
          const isAlreadyBooked = agendadosTimestamps.has(slotStart.getTime());
          if (isAvailable && isAlreadyBooked) {
            isAvailable = false;
          }

          slots.push({
            id: slotStart.getTime(),
            dataHora: slotStart,
            disponivel: isAvailable,
          });

          slotStart = slotEnd;
        }
      }
    }
    slots.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching/generating bookable slots:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}