// lib/availability.ts
import { addMinutes } from 'date-fns';

export const ALLOWED_DAY_OF_WEEK = new Set([1, 2, 3, 4, 5, 6]); // Monday through Saturday
export const DAY_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
export const SLOT_MINUTES = 60;

export const TZ = process.env.BOOKING_TIMEZONE || 'America/Los_Angeles';

export function isAllowedDayLocal(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0..6 (Sun..Sat)
  return ALLOWED_DAY_OF_WEEK.has(dow);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODateLocal(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Offset (ms) between UTC and a target IANA time zone at a given instant */
function tzOffsetMs(utcInstant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(utcInstant);

  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const zoned = Date.UTC(
    get('year'), get('month') - 1, get('day'),
    get('hour'), get('minute'), get('second')
  );
  return zoned - utcInstant.getTime(); // positive = zone ahead of UTC
}

/** Convert a local wall time in TZ (YYYY-MM-DD + HH:mm) to a UTC ISO string */
function localWallTimeToUTCISO(isoDate: string, hhmm: string, timeZone: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const [hh, mm]  = hhmm.split(':').map(Number);
  // Create a Date as if the local wall time were UTC
  const asUTC = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
  // Work out what the offset should be at that instant in the target zone
  const offset = tzOffsetMs(asUTC, timeZone);
  // Subtract offset to get the correct UTC instant
  const utc = new Date(asUTC.getTime() - offset);
  return utc.toISOString();
}

export function slotBoundsUTC(isoDate: string, hhmm: string) {
  const startISO = localWallTimeToUTCISO(isoDate, hhmm, TZ);
  const start = new Date(startISO);
  const end = addMinutes(start, SLOT_MINUTES);
  return { start: start.toISOString(), end: end.toISOString() };
}
