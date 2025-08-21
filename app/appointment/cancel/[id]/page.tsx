'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CalendarDays, MapPin, Phone, Wrench, AlertTriangle } from 'lucide-react';

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

export default function CancelAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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
    } catch (error) {
      toast.error('Failed to load appointment details');
      router.push('/book');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/appointment/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      toast.success('Appointment cancelled successfully!');
      router.push('/appointment/cancelled');
    } catch (error) {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
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

  if (booking.status === 'CANCELED') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Appointment Already Cancelled</CardTitle>
            <CardDescription>
              This appointment has already been cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/book')}>
              Book New Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Cancel Appointment
          </CardTitle>
          <CardDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Appointment Details</h3>
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

          {/* Cancellation Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Cancellation Policy</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 24-hour notice is required for cancellations</li>
              <li>• Late cancellations may incur a fee</li>
              <li>• You can reschedule instead of cancelling</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              variant="destructive"
              className="flex-1"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/appointment/edit/${bookingId}`)}
            >
              Edit Instead
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/book')}
            >
              Keep Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
