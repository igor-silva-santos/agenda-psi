import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addMinutes, setHours, setMinutes, parseISO } from "date-fns";

const APPOINTMENT_DURATION_MINUTES = 30;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ 
      error: "Unauthorized",
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  const { date, startTime, endTime } = await request.json();

  try {
    const selectedDate = parseISO(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentSlotStart = setMinutes(setHours(selectedDate, startHour), startMinute);
    const endOfWorkingDay = setMinutes(setHours(selectedDate, endHour), endMinute);

    const slotsToCreate = [];

    while (currentSlotStart.getTime() < endOfWorkingDay.getTime()) {
      const slotEnd = addMinutes(currentSlotStart, APPOINTMENT_DURATION_MINUTES);
      slotsToCreate.push({
        startDateTime: currentSlotStart,
        endDateTime: slotEnd,
      });
      currentSlotStart = slotEnd;
    }

    // Buscar slots existentes
    const { data: existingSlots, error: existingError } = await supabase
      .from('BookableSlot')
      .select('startDateTime, endDateTime');
    if (existingError) throw existingError;

    const existingSlotTimes = new Set((existingSlots || []).map(s => `${new Date(s.startDateTime).toISOString()}_${new Date(s.endDateTime).toISOString()}`));

    const newSlots = slotsToCreate.filter(slot => {
      const slotTime = `${new Date(slot.startDateTime).toISOString()}_${new Date(slot.endDateTime).toISOString()}`;
      return !existingSlotTimes.has(slotTime);
    });

    if (newSlots.length === 0) {
      return NextResponse.json({ message: 'Nenhum novo horário para adicionar.' }, { status: 200 });
    }

    const { data: createdSlots, error: createError } = await supabase
      .from('BookableSlot')
      .insert(newSlots);
    if (createError) throw createError;

    const count = Array.isArray(createdSlots) ? createdSlots.length : 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error generating bookable slots:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}