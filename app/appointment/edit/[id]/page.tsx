'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarDays, MapPin, Phone, Wrench, Mail } from 'lucide-react';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import AvailabilityPicker from '@/components/AvailabilityPicker';

interface Booking {
  id: string;
  customerName: string | null;
  customerEmail: string;
  phone: string;
  serviceType: string;
  applianceType: string;
  brand: string;
  serviceAddress: string;
  zipCode: string;
  date: string;
  startTime: string;
  status: string;
}

export default function EditAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/appointment/${bookingId}`);
      if (!response.ok) {
        throw new Error('Booking not found');
      }
      const data = await response.json();
      setBooking(data);
      
      // Set initial date and time
      if (data.date && data.startTime) {
        const [year, month, day] = data.date.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
        setSelectedTime(data.startTime);
      }
    } catch (error) {
      toast.error('Failed to load appointment details');
      router.push('/book');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!booking || !selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setSaving(true);
    try {
      const appointmentISO = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      appointmentISO.setHours(hours, minutes, 0, 0);

      const response = await fetch(`/api/appointment/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentISO: appointmentISO.toISOString(),
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          phone: booking.phone,
          serviceType: booking.serviceType,
          applianceType: booking.applianceType,
          brand: booking.brand,
          serviceAddress: booking.serviceAddress,
          zipCode: booking.zipCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      toast.success('Appointment updated successfully!');
      router.push('/appointment/success');
    } catch (error) {
      toast.error('Failed to update appointment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading appointment details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Appointment not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Appointment</CardTitle>
          <CardDescription>
            Update your appointment details. You can change the date, time, or service information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Current Appointment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>{new Date(booking.date).toLocaleDateString()} at {booking.startTime}</span>
              </div>
              <div className="flex items-center">
                <Wrench className="h-4 w-4 mr-2" />
                <span>{booking.serviceType} - {booking.applianceType}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{booking.serviceAddress}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <h3 className="font-semibold">Update Appointment</h3>
            
            {/* Date and Time Selection */}
            <div className="space-y-4">
              <div>
                <Label>Select New Date</Label>
                <AvailabilityCalendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              {selectedDate && (
                <div>
                  <Label>Select New Time</Label>
                  <AvailabilityPicker
                    date={selectedDate.toISOString().split('T')[0]}
                    value={selectedTime}
                    onSelect={setSelectedTime}
                  />
                </div>
              )}
            </div>

            {/* Service Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={booking.serviceType} onValueChange={(value) => setBooking({...booking, serviceType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="applianceType">Appliance Type</Label>
                <Select value={booking.applianceType} onValueChange={(value) => setBooking({...booking, applianceType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Washer">Washer</SelectItem>
                    <SelectItem value="Dryer">Dryer</SelectItem>
                    <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                    <SelectItem value="Dishwasher">Dishwasher</SelectItem>
                    <SelectItem value="Oven">Oven</SelectItem>
                    <SelectItem value="Microwave">Microwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={booking.brand}
                  onChange={(e) => setBooking({...booking, brand: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={booking.phone}
                  onChange={(e) => setBooking({...booking, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceAddress">Service Address</Label>
              <Input
                id="serviceAddress"
                value={booking.serviceAddress}
                onChange={(e) => setBooking({...booking, serviceAddress: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={booking.zipCode}
                  onChange={(e) => setBooking({...booking, zipCode: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="customerName">Name (Optional)</Label>
                <Input
                  id="customerName"
                  value={booking.customerName || ''}
                  onChange={(e) => setBooking({...booking, customerName: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving || !selectedDate || !selectedTime}
              className="flex-1"
            >
              {saving ? 'Updating...' : 'Update Appointment'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/book')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
