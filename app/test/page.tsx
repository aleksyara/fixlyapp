'use client';

import { useState } from 'react';

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

/** Convert a local wall time in Pacific TZ to a UTC ISO string */
function toLocalISO(dateStr: string, timeStr: string): string {
  // Use a much simpler approach: construct the date string with explicit timezone
  const pacificDateTime = `${dateStr}T${timeStr}:00-08:00`; // Always use PST offset first
  
  // Create date and check if we need DST adjustment
  const tempDate = new Date(pacificDateTime);
  const year = tempDate.getFullYear();
  const month = tempDate.getMonth() + 1; // JavaScript months are 0-based
  
  // Rough DST check: March 2nd Sunday to November 1st Sunday
  // For simplicity, use March-October as DST period
  const isDST = month >= 3 && month <= 10;
  
  // If DST, use PDT offset (-07:00)
  const finalDateTime = isDST ? 
    `${dateStr}T${timeStr}:00-07:00` : 
    `${dateStr}T${timeStr}:00-08:00`;
    
  return new Date(finalDateTime).toISOString();
}

export default function TestPage() {
  const [date, setDate] = useState('2024-01-15');
  const [time, setTime] = useState('09:00');
  const [result, setResult] = useState('');

  const testConversion = () => {
    const iso = toLocalISO(date, time);
    const localDate = new Date(iso);
    const pacificTime = localDate.toLocaleString('en-US', { 
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    setResult(`
      Input: ${date} ${time} (Pacific Time)
      ISO: ${iso}
      Converted back to Pacific: ${pacificTime}
    `);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Timezone Conversion Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date (YYYY-MM-DD)</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Time (HH:MM)</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        
        <button
          onClick={testConversion}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Conversion
        </button>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
