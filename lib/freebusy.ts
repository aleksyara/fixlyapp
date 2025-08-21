// lib/freebusy.ts
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';
import { slotBoundsUTC, isAllowedDayLocal, DAY_SLOTS } from './availability';

// Simple in-memory cache for availability data
const availabilityCache = new Map<string, { slots: string[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Track ongoing requests to prevent duplicate API calls
const ongoingRequests = new Map<string, Promise<string[]>>();

export async function freeSlotsForDate(isoDate: string): Promise<string[]> {
  if (!isAllowedDayLocal(isoDate)) return [];

  // Check cache first
  const cached = availabilityCache.get(isoDate);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.slots;
  }

  // Check if there's already an ongoing request for this date
  const ongoingRequest = ongoingRequests.get(isoDate);
  if (ongoingRequest) {
    return ongoingRequest;
  }

  // Create new request
  const requestPromise = fetchAvailabilityFromGoogle(isoDate);
  ongoingRequests.set(isoDate, requestPromise);

  try {
    const slots = await requestPromise;
    // Cache the result
    availabilityCache.set(isoDate, { slots, timestamp: Date.now() });
    return slots;
  } finally {
    // Clean up ongoing request
    ongoingRequests.delete(isoDate);
  }
}

async function fetchAvailabilityFromGoogle(isoDate: string): Promise<string[]> {
  const cal = calendarClient();
  const { CALENDAR_ID } = getCalendarConfig();

  // Whole-day bounds in UTC for the freebusy request
  const start = new Date(`${isoDate}T00:00:00.000Z`);
  const end   = new Date(`${isoDate}T23:59:59.999Z`);

  const res = await cal.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: CALENDAR_ID }],
    },
  });

  const periods = (res.data.calendars?.[CALENDAR_ID]?.busy ?? []) as Array<{ start?: string; end?: string }>;

  const available: string[] = [];
  for (const hhmm of DAY_SLOTS) {
    const { start: s, end: e } = slotBoundsUTC(isoDate, hhmm);
    const busy = periods.some((p) => overlaps(p.start!, p.end!, s, e));
    if (!busy) available.push(hhmm);
  }
  return available;
}

function overlaps(busyStart: string, busyEnd: string, s: string, e: string) {
  return new Date(busyStart) < new Date(e) && new Date(busyEnd) > new Date(s);
}

// Function to clear cache (useful for testing or manual refresh)
export function clearAvailabilityCache() {
  availabilityCache.clear();
  ongoingRequests.clear();
}
