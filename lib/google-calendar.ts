// lib/google-calendar.ts
import { google } from 'googleapis';

/**
 * Read and validate env, but only when called (not at module load time).
 */
export function getCalendarConfig() {
  // Force fresh read of environment variables
  const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID?.trim();
  const TZ = (process.env.BOOKING_TIMEZONE || 'America/Los_Angeles').trim();
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  // Enhanced debug logging with more details
  // console.log('[google-calendar] env present?', {
  //   hasEmail: !!email,
  //   hasKey: !!keyRaw,
  //   hasCal: !!CALENDAR_ID,
  // });

  // console.log('[google-calendar] CALENDAR_ID details:', {
  //   value: CALENDAR_ID,
  //   length: CALENDAR_ID?.length || 0,
  //   first10: CALENDAR_ID?.substring(0, 10) || 'undefined',
  //   last10: CALENDAR_ID?.substring(-10) || 'undefined',
  //   rawValue: process.env.GOOGLE_CALENDAR_ID,
  //   rawLength: process.env.GOOGLE_CALENDAR_ID?.length || 0
  // });

  // Log all environment variables for debugging
  // console.log('[google-calendar] All env vars:', {
  //   GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
  //   GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  //   GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'PRESENT' : 'MISSING',
  //   BOOKING_TIMEZONE: process.env.BOOKING_TIMEZONE,
  //   NODE_ENV: process.env.NODE_ENV
  // });

  if (!email || !keyRaw || !CALENDAR_ID) {
    console.error('[google-calendar] ENV CHECK FAILED', {
      hasEmail: !!email,
      hasKey: !!keyRaw,
      hasCalendarId: !!CALENDAR_ID,
      CALENDAR_ID: CALENDAR_ID || 'undefined',
      email: email || 'undefined',
      keyRaw: keyRaw ? `${keyRaw.substring(0, 50)}...` : 'undefined',
    });
    throw new Error('Missing Google env vars (service account or calendar id).');
  }

  // turn "\n" sequences back into real newlines
  const key = keyRaw.replace(/\\n/g, '\n');
  return { CALENDAR_ID, TZ, email, key };
}

/**
 * Construct an authenticated Calendar client using the service account.
 */
export function calendarClient() {
  const { email, key } = getCalendarConfig();
  const jwt = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth: jwt });
}
