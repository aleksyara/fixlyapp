'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CalendarDays, MapPin, Phone, Wrench, Mail, User, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
  serialNumber?: string;
  problemDescription?: string;
}

export default function ViewAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

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
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600 mt-2">
                {new Date(booking.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {formatTime(booking.startTime)}
              </p>
            </div>
            <Badge className={`text-lg px-4 py-2 ${getStatusColor(booking.status)}`}>
              {booking.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.customerName || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Customer Name</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.customerEmail}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.phone}</p>
                  <p className="text-sm text-gray-600">Phone Number</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">{booking.serviceAddress}</p>
                  <p className="text-sm text-gray-600">Service Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Wrench className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.serviceType}</p>
                  <p className="text-sm text-gray-600">Service Type</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Wrench className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.applianceType}</p>
                  <p className="text-sm text-gray-600">Appliance Type</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Wrench className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.brand}</p>
                  <p className="text-sm text-gray-600">Brand</p>
                </div>
              </div>
              
              {booking.serialNumber && (
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{booking.serialNumber}</p>
                    <p className="text-sm text-gray-600">Serial Number</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {new Date(booking.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">Date</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{formatTime(booking.startTime)}</p>
                  <p className="text-sm text-gray-600">Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem Description */}
          {booking.problemDescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Problem Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {booking.problemDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push(`/appointment/edit/${booking.id}`)}
            className="w-full sm:w-auto"
          >
            Edit Appointment
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
