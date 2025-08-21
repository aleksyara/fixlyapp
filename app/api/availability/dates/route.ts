import { NextResponse } from 'next/server';
import { isAllowedDayLocal } from '@/lib/availability';

export async function GET(req: Request) {
  try {
    const month = new URL(req.url).searchParams.get('month');
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Missing or invalid month (expected YYYY-MM)' }, { status: 400 });
    }
    
    // Generate all available dates for the month
    const [year, monthNum] = month.split('-').map(Number);
    const availableDates: string[] = [];
    
    // Get the first day of the month
    const firstDay = new Date(year, monthNum - 1, 1);
    // Get the last day of the month
    const lastDay = new Date(year, monthNum, 0);
    
    // Check each day in the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, monthNum - 1, day);
      const isoDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      if (isAllowedDayLocal(isoDate)) {
        availableDates.push(isoDate);
      }
    }
    
    return NextResponse.json({ availableDates });
  } catch (error) {
    console.error('Availability dates API error:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
