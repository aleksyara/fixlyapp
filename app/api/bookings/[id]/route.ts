// app/api/booking/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';
import { slotBoundsUTC } from '@/lib/availability';

// DELETE /api/booking/:id (Google eventId)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cal = calendarClient();
  const { CALENDAR_ID } = getCalendarConfig();

  try {
    await cal.events.delete({ calendarId: CALENDAR_ID, eventId: id });
  } catch {
    // If it's already gone on Google, still mark locally
  }

  await prisma.booking.updateMany({
    where: { googleEventId: id },
    data: { status: 'CANCELED' },
  });

  return NextResponse.json({ ok: true });
}

// PUT /api/booking/:id  body: { date: "YYYY-MM-DD", time: "HH:mm" }
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { date, time } = await req.json().catch(() => ({} as any));
  if (!date || !time) {
    return NextResponse.json({ error: 'date/time required' }, { status: 400 });
  }

  const { start, end } = slotBoundsUTC(date, time);
  const cal = calendarClient();
  const { CALENDAR_ID, TZ } = getCalendarConfig();

  const ev = await cal.events.patch({
    calendarId: CALENDAR_ID,
    eventId: id,
    requestBody: {
      start: { dateTime: start, timeZone: TZ },
      end:   { dateTime: end,   timeZone: TZ },
    },
  });

  await prisma.booking.updateMany({
    where: { googleEventId: id },
    data: { date, startTime: time, status: 'CONFIRMED' },
  });

  return NextResponse.json({ ok: true, htmlLink: ev.data.htmlLink });
}
