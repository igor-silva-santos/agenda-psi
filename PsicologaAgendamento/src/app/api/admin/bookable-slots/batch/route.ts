import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const batchSlotsSchema = z.object({
  slots: z.array(z.object({
    startDateTime: z.string().datetime(),
    endDateTime: z.string().datetime(),
  })),
});

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
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = batchSlotsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { slots } = validation.data;

    // Buscar slots existentes
    const { data: existingSlots, error: existingError } = await supabase
      .from('BookableSlot')
      .select('startDateTime, endDateTime');
    if (existingError) throw existingError;

    const existingSlotTimes = new Set((existingSlots || []).map(s => `${new Date(s.startDateTime).toISOString()}_${new Date(s.endDateTime).toISOString()}`));

    const newSlots = slots.filter(slot => {
      const slotTime = `${new Date(slot.startDateTime).toISOString()}_${new Date(slot.endDateTime).toISOString()}`;
      return !existingSlotTimes.has(slotTime);
    });

    if (newSlots.length === 0) {
      return NextResponse.json({ message: 'Nenhum novo horário para adicionar.' }, { status: 200 });
    }

    const { data: createdSlots, error: createError } = await supabase
      .from('BookableSlot')
      .insert(newSlots)
      .select();
    if (createError) throw createError;

    const count = createdSlots ? createdSlots.length : 0;
    return NextResponse.json({ count }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar múltiplos horários:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
