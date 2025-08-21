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

  // Handle different private key formats
  let key = keyRaw;
  
  // Remove any surrounding quotes and trim whitespace
  key = key.replace(/^["']|["']$/g, '').trim();
  
  // If the key contains literal \n sequences, convert them to actual newlines
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }
  
  // If the key doesn't start with -----BEGIN PRIVATE KEY-----, try different approaches
  if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
    try {
      // Try to decode as base64
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
        key = decoded;
      }
    } catch (e) {
      // If base64 decoding fails, try to construct the key manually
      console.warn('[google-calendar] Failed to decode private key as base64, trying manual construction');
      
      // Check if it looks like a base64-encoded key without headers
      if (key.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(key)) {
        // This looks like a base64 key without headers, add them
        key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
      }
    }
  }
  
  // Ensure proper formatting with newlines
  if (key.includes('-----BEGIN PRIVATE KEY-----') && !key.includes('\n')) {
    // Key has headers but no newlines, add them
    key = key.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
    key = key.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
  }
  
  // Additional fix: ensure the key content is properly formatted
  if (key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('-----END PRIVATE KEY-----')) {
    const beginIndex = key.indexOf('-----BEGIN PRIVATE KEY-----');
    const endIndex = key.indexOf('-----END PRIVATE KEY-----');
    const header = key.substring(0, beginIndex + 27);
    const footer = key.substring(endIndex);
    const content = key.substring(beginIndex + 27, endIndex).trim();
    
    // Reconstruct with proper formatting
    key = `${header}\n${content}\n${footer}`;
  }
  
  console.log('[google-calendar] Key format check:', {
    hasBegin: key.includes('-----BEGIN PRIVATE KEY-----'),
    hasEnd: key.includes('-----END PRIVATE KEY-----'),
    hasNewlines: key.includes('\n'),
    keyLength: key.length,
    firstLine: key.split('\n')[0],
    lastLine: key.split('\n').slice(-1)[0]
  });
  
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
