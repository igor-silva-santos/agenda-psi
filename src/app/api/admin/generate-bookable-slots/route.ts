import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addMinutes, setHours, setMinutes, parseISO } from "date-fns";

const APPOINTMENT_DURATION_MINUTES = 30;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
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

    const existingSlots = await prisma.bookableSlot.findMany({
      where: {
        OR: slotsToCreate.map(slot => ({
          startDateTime: new Date(slot.startDateTime),
          endDateTime: new Date(slot.endDateTime),
        })),
      },
    });

    const existingSlotTimes = new Set(existingSlots.map(s => `${s.startDateTime.toISOString()}_${s.endDateTime.toISOString()}`));

    const newSlots = slotsToCreate.filter(slot => {
      const slotTime = `${new Date(slot.startDateTime).toISOString()}_${new Date(slot.endDateTime).toISOString()}`;
      return !existingSlotTimes.has(slotTime);
    });

    if (newSlots.length === 0) {
      return NextResponse.json({ message: 'Nenhum novo horário para adicionar.' }, { status: 200 });
    }

    const createdSlots = await prisma.bookableSlot.createMany({
      data: newSlots.map(slot => ({
        startDateTime: new Date(slot.startDateTime),
        endDateTime: new Date(slot.endDateTime),
      })),
    });

    return NextResponse.json({ count: createdSlots.count });
  } catch (error) {
    console.error("Error generating bookable slots:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}