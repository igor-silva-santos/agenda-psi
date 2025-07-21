import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays, setHours, setMinutes, isBefore, isAfter, isEqual, format, parse } from 'date-fns';
import { getToken } from 'next-auth/jwt';

export async function POST(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    return new NextResponse('Sessão concorrente detectada', { status: 401 });
  }
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { startDateTime, endDateTime } = await request.json();

  try {
    const newSlot = await prisma.bookableSlot.create({
      data: {
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
      },
    });
    return NextResponse.json(newSlot);
  } catch (error) {
    console.error("Error creating bookable slot:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all');

  // NOVA LÓGICA: gerar slots dinâmicos de 1h para os próximos 30 dias
  try {
    // 1. Buscar horários de atuação padrão
    const horariosAtuacao = await prisma.horarioAtuacao.findMany();
    if (!horariosAtuacao || horariosAtuacao.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Buscar horários já agendados (slots já ocupados)
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        dataHora: {
          gte: new Date(),
        },
        status: { not: 'CANCELADO' },
      },
      select: { dataHora: true },
    });
    const agendadosSet = new Set(agendamentos.map(a => a.dataHora.toISOString()));

    // 3. Buscar períodos bloqueados
    const bloqueios = await prisma.horarioBloqueado.findMany({
      where: {
        dataHoraFim: { gte: new Date() },
      },
    });

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
            // Pula se o início OU o fim do slot estiver dentro do almoço, ou se o slot englobar o almoço
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
          const isBlocked = bloqueios.some(b =>
            (slotStart >= b.dataHoraInicio && slotStart < b.dataHoraFim) ||
            (slotEnd > b.dataHoraInicio && slotEnd <= b.dataHoraFim)
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
            id: slotStart.getTime(), // id único baseado no timestamp do início do slot
            startDateTime: slotStart,
            endDateTime: slotEnd,
            isBooked: false,
          });
          slotStart = slotEnd;
        }
      }
    }
    // Ordenar slots por data/hora
    slots.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching/generating bookable slots:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}