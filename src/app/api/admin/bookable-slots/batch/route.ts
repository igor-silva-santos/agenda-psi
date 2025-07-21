import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const batchSlotsSchema = z.object({
  slots: z.array(z.object({
    startDateTime: z.string().datetime(),
    endDateTime: z.string().datetime(),
  })),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = batchSlotsSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Dados inválidos', details: validation.error.format() }), { status: 400 });
    }

    const { slots } = validation.data;

    const existingSlots = await prisma.bookableSlot.findMany({
      where: {
        OR: slots.map(slot => ({
          startDateTime: new Date(slot.startDateTime),
          endDateTime: new Date(slot.endDateTime),
        })),
      },
    });

    const existingSlotTimes = new Set(existingSlots.map(s => `${s.startDateTime.toISOString()}_${s.endDateTime.toISOString()}`));

    const newSlots = slots.filter(slot => {
      const slotTime = `${new Date(slot.startDateTime).toISOString()}_${new Date(slot.endDateTime).toISOString()}`;
      return !existingSlotTimes.has(slotTime);
    });

    if (newSlots.length === 0) {
      return NextResponse.json({ message: 'Nenhum novo horário para adicionar.' }, { status: 200 });
    }

    const result = await prisma.bookableSlot.createMany({
      data: newSlots.map(slot => ({
        startDateTime: new Date(slot.startDateTime),
        endDateTime: new Date(slot.endDateTime),
      })),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar múltiplos horários:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
