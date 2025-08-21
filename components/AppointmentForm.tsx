'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, MapPin, Phone, Wrench, Mail } from 'lucide-react';
import { toast } from 'sonner';
import useServiceFee from '../hooks/useServiceFee';
import { normalizePhone, normalizeZip } from '@/lib/zipUtils';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import AvailabilityPicker from '@/components/AvailabilityPicker';
import { toISODate, fromISODateLocal } from '@/lib/dateUtils';

type FormState = {
  serviceType: string;
  applianceType: string;
  brand: string;
  serialNumber?: string;
  email: string;
  phone: string;         // digits only
  serviceAddress: string;
  zipCode: string;       // 5-digit ZIP
  customerName?: string;
  date: string;          // yyyy-mm-dd
  time: string;          // HH:mm (24h)
  consent: boolean;
  brandOther?: string;
  applianceOther?: string;
};

const APPLIANCE_TYPES = ['Dryer','Washer','Oven','Refrigerator','Dishwasher','Other'] as const;
const BRANDS = ['Whirlpool','Samsung','LG','KitchenAid','Viking','GE','Bosch','Frigidaire','Other'] as const;
const SERVICE_TYPES = ['Installation','Repair'] as const;

const isTenDigitPhone = (v: string) => /^\d{10}$/.test(v.replace(/\D/g, ''));
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function toLocalISO(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
}

export default function AppointmentForm() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormState>({
    serviceType: '',
    applianceType: '',
    brand: '',
    serialNumber: '',
    email: '',
    phone: '',
    serviceAddress: '',
    zipCode: '',
    customerName: '',
    date: '',
    time: '',
    consent: false,
    brandOther: '',
    applianceOther: '',
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (key === 'phone' && typeof value === 'string') value = normalizePhone(value) as any;
    if (key === 'zipCode' && typeof value === 'string') value = normalizeZip(value) as any;
    setForm((f) => ({ ...f, [key]: value }));
  }

  const effectiveAppliance = useMemo(
    () => (form.applianceType === 'Other' ? form.applianceOther?.trim() || 'Other' : form.applianceType),
    [form.applianceType, form.applianceOther]
  );
  const effectiveBrand = useMemo(
    () => (form.brand === 'Other' ? form.brandOther?.trim() || 'Other' : form.brand),
    [form.brand, form.brandOther]
  );

  // ZIP → fee
  const { valid: zipValid, fee, isOC } = useServiceFee(form.zipCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // validations
    if (!form.serviceType || !effectiveAppliance || !effectiveBrand) {
      toast.error('Please complete Service Type, Appliance Type, and Brand.');
      return;
    }
    if (!form.email || !isEmail(form.email)) {
      toast.error('Please enter a valid email.');
      return;
    }
    if (!isTenDigitPhone(form.phone)) {
      toast.error('Please enter a 10‑digit phone number (digits only).');
      return;
    }
    if (!form.serviceAddress.trim()) {
      toast.error('Service address is required.');
      return;
    }
    if (!zipValid) {
      toast.error('Please enter a 5‑digit ZIP code.');
      return;
    }
    if (!form.date || !form.time) {
      toast.error('Please choose a date and time.');
      return;
    }
    if (!form.consent) {
      toast.error('Please consent to store your information.');
      return;
    }

    const appointmentISO = toLocalISO(form.date, form.time);

    setLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: form.serviceType,
          applianceType: effectiveAppliance,
          brand: effectiveBrand,
          serialNumber: form.serialNumber?.trim() || undefined,
          customerName: form.customerName?.trim() || undefined,
          customerEmail: form.email.trim(),
          phone: form.phone,
          serviceAddress: form.serviceAddress.trim(),
          zipCode: form.zipCode,
          appointmentISO,
          durationMinutes: 60,     // fixed length
          serviceFee: fee,
          isOrangeCounty: isOC,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Booking failed.');

      toast.success('Appointment booked! A confirmation email is on the way.');
      setForm((f) => ({ ...f, serialNumber: '' }));
      if (json.htmlLink) window.open(json.htmlLink, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Could not book the appointment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Book an Appointment
        </CardTitle>
        <CardDescription>We’ll confirm by email and add it to the calendar.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Service type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Service Type *</Label>
              <Select value={form.serviceType} onValueChange={(v) => update('serviceType', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Appliance Type *
              </Label>
              <Select value={form.applianceType} onValueChange={(v) => update('applianceType', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {APPLIANCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.applianceType === 'Other' && (
                <Input
                  className="mt-2"
                  placeholder="Enter appliance type"
                  value={form.applianceOther}
                  onChange={(e) => update('applianceOther', e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Brand / S/N */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Brand *</Label>
              <Select value={form.brand} onValueChange={(v) => update('brand', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.brand === 'Other' && (
                <Input
                  className="mt-2"
                  placeholder="Enter brand"
                  value={form.brandOther}
                  onChange={(e) => update('brandOther', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Serial Number (optional)</Label>
              <Input
                className="mt-1"
                value={form.serialNumber}
                onChange={(e) => update('serialNumber', e.target.value)}
                placeholder="e.g., KRFC704FPS-00"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email *
              </Label>
              <Input
                type="email"
                className="mt-1"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone (digits only) *
              </Label>
              <Input
                inputMode="numeric"
                className="mt-1"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                maxLength={10}
                placeholder="9494149956"
                required
              />
            </div>
          </div>

          {/* Address + ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Service Address *
              </Label>
              <Input
                className="mt-1"
                value={form.serviceAddress}
                onChange={(e) => update('serviceAddress', e.target.value)}
                placeholder="Street, City, State"
                required
              />
            </div>
            <div>
              <Label>Zip Code *</Label>
              <Input
                inputMode="numeric"
                className="mt-1"
                value={form.zipCode}
                onChange={(e) => update('zipCode', e.target.value)}
                maxLength={5}
                placeholder="92620"
                required
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 gap-4">
            <AvailabilityCalendar
              value={form.date ? fromISODateLocal(form.date) : undefined}
              onChange={(d) => {
                const iso = d ? toISODate(d) : '';
                setForm(f => ({ ...f, date: iso, time: '' }));
              }}
            />

            {!!form.date && (
              <AvailabilityPicker
                date={form.date}
                value={form.time}
                onSelect={(t) => update('time', t)}
              />
            )}
          </div>

          {/* Consent */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={form.consent}
              onCheckedChange={(v) => update('consent', Boolean(v))}
            />
            <Label htmlFor="consent" className="leading-snug">
              I consent to having this website store my submitted information so they can respond to my inquiry.
            </Label>
          </div>

          {/* Service Fee Summary */}
          {zipValid && (
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-sm text-gray-700">
                Service Call Fee:{' '}
                <span className="font-semibold">${fee?.toFixed(2)}</span>
                {isOC ? (
                  <span className="ml-2 text-green-700">(Orange County rate)</span>
                ) : (
                  <span className="ml-2 text-gray-600">(Outside Orange County)</span>
                )}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Booking…' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
