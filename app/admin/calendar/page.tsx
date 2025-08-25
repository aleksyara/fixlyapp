'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  serviceType: string;
  applianceType: string;
  status: string;
  customerName: string;
  customerEmail: string;
  serviceAddress: string;
  phone: string;
  technician?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminCalendarPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !hasRole('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    fetchAllBookings();
  }, [user, hasRole, router]);

  const fetchAllBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getDayBookings = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateStr);
  };

  const getHourSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const getServiceHours = () => {
    return {
      start: 8,
      end: 20,
      label: '8:00 AM - 8:00 PM'
    };
  };

  const getBookingsForHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      if (booking.date !== dateStr) return false;
      const bookingHour = parseInt(booking.startTime.split(':')[0]);
      return bookingHour === hour;
    });
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!hasRole('ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates(currentDate);
  const todayBookings = getDayBookings(currentDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">

        <Card className="flex-1 flex flex-col m-4">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Bookings
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Service Hours: {getServiceHours().label}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                  >
                    Day
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {viewMode === 'week' ? (
              <div className="space-y-4">
                {/* Week Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek('prev')}
                    className="w-full sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous Week</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <h3 className="text-lg font-medium text-center">
                    {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek('next')}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Next Week</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Week Calendar */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                  
                  {weekDates.map((date, index) => {
                    const dayBookings = getDayBookings(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[180px] sm:min-h-[200px] p-2 sm:p-3 border rounded-lg ${
                          isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-center mb-2">
                          <div className={`text-sm font-medium ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {date.getDate()}
                          </div>
                          {isToday && (
                            <div className="text-xs text-blue-600 font-medium">Today</div>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {dayBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="text-xs p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
                              title={`${booking.customerName} - ${booking.serviceType} ${booking.applianceType} - ${booking.serviceAddress}`}
                              onClick={() => router.push(`/appointment/view/${booking.id}`)}
                            >
                              <div className="font-medium truncate text-[11px] sm:text-xs">
                                {booking.startTime}
                              </div>
                              <div className="truncate text-gray-600 text-[10px] sm:text-xs">
                                {booking.customerName}
                              </div>
                              <div className="truncate text-gray-500 text-[9px] sm:text-[11px] leading-tight">
                                {booking.serviceAddress}
                              </div>
                              {booking.technician && (
                                <div className="truncate text-blue-600 text-[8px] sm:text-[10px]">
                                  Tech: {booking.technician.name}
                                </div>
                              )}
                              <Badge className={`text-[8px] sm:text-xs ${getStatusColor(booking.status)} mt-1`}>
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Day Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDay('prev')}
                    className="w-full sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous Day</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <h3 className="text-lg font-medium text-center">
                    {currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDay('next')}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Next Day</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Day Schedule with Hour Slots */}
                <div className="space-y-2">
                  {getHourSlots().map((hour) => {
                    const hourBookings = getBookingsForHour(currentDate, hour);
                    const timeLabel = `${hour}:00`;
                    
                    return (
                      <div key={hour} className="border rounded-lg bg-gray-50">
                        <div className="bg-gray-100 px-3 py-2 border-b">
                          <span className="font-medium text-sm">{timeLabel}</span>
                        </div>
                        <div className="p-2">
                          {hourBookings.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-sm">
                              No bookings
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {hourBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => router.push(`/appointment/view/${booking.id}`)}
                                >
                                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium text-sm">
                                          {formatTime(booking.startTime)}
                                        </span>
                                        <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                                          {booking.status}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium text-sm">{booking.customerName}</span>
                                      </div>
                                      
                                      <div className="text-xs text-gray-600">
                                        {booking.serviceType} - {booking.applianceType}
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-gray-500" />
                                        <span className="text-xs text-gray-600 truncate max-w-[200px]">
                                          {booking.serviceAddress}
                                        </span>
                                      </div>

                                      {booking.technician && (
                                        <div className="flex items-center gap-2">
                                          <User className="h-3 w-3 text-blue-500" />
                                          <span className="text-xs text-blue-600 font-medium">
                                            Tech: {booking.technician.name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="text-left sm:text-right text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {booking.phone}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {booking.customerEmail}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
