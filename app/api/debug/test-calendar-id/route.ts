import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get('id');
  
  if (!calendarId) {
    return NextResponse.json({
      error: 'Please provide a calendar ID as query parameter: ?id=your-calendar-id'
    }, { status: 400 });
  }

  return NextResponse.json({
    message: 'Calendar ID test',
    providedCalendarId: calendarId,
    instructions: [
      '1. Copy this calendar ID',
      '2. Update your .env.local file: GOOGLE_CALENDAR_ID=' + calendarId,
      '3. Restart your development server',
      '4. Test booking an appointment'
    ],
    note: 'Make sure to share this calendar with your service account email: fixlyappliances@green-jet-469604-i5.iam.gserviceaccount.com'
  });
}
