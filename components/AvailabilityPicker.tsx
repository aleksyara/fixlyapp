// components/AvailabilityPicker.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Props = {
  date: string;    // YYYY-MM-DD
  value?: string;  // HH:mm
  onSelect: (time: string) => void;
};

export default function AvailabilityPicker({ date, value, onSelect }: Props) {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchAvailability = useCallback(async (targetDate: string) => {
    // Don't fetch if we already have data for this date
    if (lastFetchedDate === targetDate && slots.length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/availability?date=${encodeURIComponent(targetDate)}`, {
        headers: { accept: 'application/json' },
        // Add cache control to leverage browser caching
        cache: 'default'
      });
      
      const json = await safeJson<{ slots: string[] }>(res);
      const newSlots = Array.isArray(json.slots) ? json.slots : [];
      
      setSlots(newSlots);
      setLastFetchedDate(targetDate);
    } catch (e: any) {
      setSlots([]);
      setError(e?.message || 'Failed to load availability.');
    } finally {
      setLoading(false);
    }
  }, [lastFetchedDate, slots.length]);

  useEffect(() => {
    if (!date) return;
    fetchAvailability(date);
  }, [date, fetchAvailability]);

  // Memoize the time slots to prevent unnecessary re-renders
  const timeSlots = useMemo(() => {
    return slots.map((t) => (
      <Button
        key={t}
        type="button"
        variant={t === value ? 'default' : 'outline'}
        onClick={() => onSelect(t)}
        className="min-w-[80px]"
      >
        {to12h(t)}
      </Button>
    ));
  }, [slots, value, onSelect]);

  return (
    <div className="space-y-2">
      <Label>Available times for {date}</Label>
      {loading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading availability...</span>
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        slots.length === 0 ? (
          <div className="text-sm text-muted-foreground">No availability for this date.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {timeSlots}
          </div>
        )
      )}
    </div>
  );
}

async function safeJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    if (ct.includes('application/json')) {
      const j = await res.json().catch(() => ({}));
      throw new Error((j as any)?.error || `HTTP ${res.status}`);
    }
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON but received: ${text.slice(0, 120)}`);
  }
  return res.json();
}

function to12h(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h = ((hh + 11) % 12) + 1;
  return `${h}:${String(mm).padStart(2,'0')} ${ampm}`;
}
