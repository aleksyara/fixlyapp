'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { toISODate } from '@/lib/dateUtils';

type Props = {
  value?: Date | undefined;
  onChange: (d: Date | undefined) => void;
};

type MonthAvailability = { availableDates: string[] };

export default function AvailabilityCalendar({ value, onChange }: Props) {
  const [month, setMonth] = React.useState<Date>(value ?? new Date());
  const [availableSet, setAvailableSet] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const y = month.getFullYear();
    const m = String(month.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/availability/dates?month=${key}`, {
          headers: { accept: 'application/json' },
        });
        const json = await safeJson<MonthAvailability>(res);
        setAvailableSet(new Set(json?.availableDates ?? []));
      } catch (e: any) {
        setErr(e?.message || 'Failed to load availability.');
        setAvailableSet(new Set());
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  const allowMonFri = (d: Date) => {
    const dow = d.getDay(); // Sun=0, Mon=1, ... Fri=5, Sat=6
    return dow === 1 || dow === 5;
  };

  const disabled = [
    // 1) Disable all non-Mon/Fri
    (d: Date) => !allowMonFri(d),
    // 2) If server provided a set, only allow Mon/Fri that are in it
    (d: Date) => {
      if (availableSet.size === 0) return false; // allow all Mon/Fri if no data
      return !availableSet.has(toISODate(d));
    },
  ];

  return (
    <div className="space-y-2">
      <Label>Pick a date</Label>
      {loading && <div className="text-sm text-muted-foreground">Loading calendar…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
      <Calendar
        mode="single"
        selected={value}
        onSelect={onChange}
        onMonthChange={setMonth}
        disabled={disabled}
        initialFocus
      />
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
