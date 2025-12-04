"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, Users, Clock, Mail, CalendarClock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import TechnicianCalendar from "@/components/TechnicianCalendar"
import { useToast } from "@/hooks/use-toast"
import AvailabilityCalendar from "@/components/AvailabilityCalendar"
import AvailabilityPicker from "@/components/AvailabilityPicker"
import { fromISODateLocal } from "@/lib/dateUtils"

interface Booking {
  id: string
  date: string
  startTime: string
  serviceType: string
  applianceType: string
  status: string
  customerName: string
  customerEmail: string
  serviceAddress: string
  phone: string
}

interface Quote {
  id: string
  bookingId: string
  amount: number
  description: string
  status: string
  createdAt: string
  booking: Booking
}

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [sendingFollowUp, setSendingFollowUp] = useState<string | null>(null)
  const [reschedulingQuoteId, setReschedulingQuoteId] = useState<string | null>(null)
  const [reschedulingInProgress, setReschedulingInProgress] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined)
  const [rescheduleTime, setRescheduleTime] = useState<string>("")
  const [quoteForm, setQuoteForm] = useState({
    amount: "",
    description: ""
  })

  useEffect(() => {
    if (user?.id) {
      fetchTechnicianData()
    }
  }, [user])

  const fetchTechnicianData = async () => {
    try {
      const [bookingsRes, quotesRes] = await Promise.all([
        fetch(`/api/technician/bookings?technicianId=${user.id}`),
        fetch(`/api/technician/quotes?technicianId=${user.id}`)
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        console.log("Technician bookings fetched:", bookingsData)
        setBookings(bookingsData)
      } else {
        const errorData = await bookingsRes.json()
        console.error("Error fetching bookings:", errorData)
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch bookings",
          variant: "destructive",
        })
      }

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json()
        setQuotes(quotesData)
      }
    } catch (error) {
      console.error("Error fetching technician data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch technician data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createQuote = async (bookingId: string) => {
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          technicianId: user.id,
          amount: parseFloat(quoteForm.amount),
          description: quoteForm.description,
        }),
      })

      if (response.ok) {
        setQuoteForm({ amount: "", description: "" })
        setSelectedBooking(null)
        fetchTechnicianData() // Refresh data
        toast({
          title: "Success",
          description: "Quote created successfully",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to create quote",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating quote:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const sendFollowUp = async (quoteId: string) => {
    setSendingFollowUp(quoteId)
    try {
      const response = await fetch(`/api/quotes/${quoteId}/follow-up`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Follow-up email sent successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send follow-up email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending follow-up:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSendingFollowUp(null)
    }
  }

  const rescheduleBooking = async (quoteId: string, bookingId: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive",
      })
      return
    }

    setReschedulingInProgress(quoteId)
    try {
      // Convert date to ISO string format (YYYY-MM-DD)
      const dateStr = rescheduleDate.toISOString().split('T')[0]
      
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateStr,
          time: rescheduleTime,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Booking rescheduled successfully. The client has been notified.",
        })
        setRescheduleDate(undefined)
        setRescheduleTime("")
        setReschedulingQuoteId(null)
        fetchTechnicianData() // Refresh data
      } else {
        const errorMessage = data.error || "Failed to reschedule booking"
        toast({
          title: "Reschedule Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error rescheduling booking:", error)
      toast({
        title: "Network Error",
        description: error?.message || "Failed to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setReschedulingInProgress(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "CANCELED":
        return "bg-red-100 text-red-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">{quotes.filter(q => q.status === "PENDING").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Quotes Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ${quotes.filter(q => q.status === "PENDING").reduce((sum, q) => sum + q.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => b.status === "COMPLETED" && new Date(b.date).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Assigned Bookings</TabsTrigger>
          <TabsTrigger value="calendar">My Schedule</TabsTrigger>
          <TabsTrigger value="quotes">My Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Bookings</CardTitle>
              <CardDescription>Your upcoming and completed appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No assigned bookings found</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{booking.serviceType} - {booking.applianceType}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                        </p>
                        <p className="text-sm text-gray-600">{booking.serviceAddress}</p>
                        <p className="text-sm text-gray-600">Customer: {booking.customerName} ({booking.customerEmail})</p>
                        <p className="text-sm text-gray-600">Phone: {booking.phone}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Dialog open={selectedBooking?.id === booking.id} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              Create Quote
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Quote for {booking.customerName}</DialogTitle>
                              <DialogDescription>
                                Provide a detailed quote for the service request.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="amount">Amount ($)</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  step="0.01"
                                  value={quoteForm.amount}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                  id="description"
                                  value={quoteForm.description}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                                  placeholder="Describe the services and any additional details..."
                                  rows={4}
                                />
                              </div>
                              <Button
                                onClick={() => createQuote(booking.id)}
                                disabled={!quoteForm.amount || !quoteForm.description}
                                className="w-full"
                              >
                                Send Quote
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <TechnicianCalendar 
            bookings={bookings} 
            onBookingClick={(booking) => router.push(`/appointment/view/${booking.id}`)}
          />
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Quotes</CardTitle>
              <CardDescription>Quotes you've created for customers</CardDescription>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No quotes found</p>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">Quote #{quote.id.slice(-8)}</p>
                          <p className="text-lg font-semibold text-blue-600">${quote.amount.toFixed(2)}</p>
                        </div>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{quote.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 pt-3 border-t">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Client Information</p>
                          <p className="text-sm text-gray-700">{quote.booking.customerName}</p>
                          <p className="text-sm text-gray-600">{quote.booking.customerEmail}</p>
                          <p className="text-sm text-gray-600">Phone: {quote.booking.phone}</p>
                          <p className="text-sm text-gray-600">{quote.booking.serviceAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Service Details</p>
                          <p className="text-sm text-gray-700">{quote.booking.serviceType} - {quote.booking.applianceType}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(quote.booking.date).toLocaleDateString()} at {quote.booking.startTime}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => sendFollowUp(quote.id)}
                          disabled={sendingFollowUp === quote.id}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          {sendingFollowUp === quote.id ? "Sending..." : "Follow Up"}
                        </Button>
                        <Dialog 
                          open={reschedulingQuoteId === quote.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setReschedulingQuoteId(null)
                              setRescheduleDate(undefined)
                              setRescheduleTime("")
                            } else {
                              setReschedulingQuoteId(quote.id)
                              setRescheduleDate(fromISODateLocal(quote.booking.date))
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              disabled={reschedulingInProgress === quote.id}
                            >
                              <CalendarClock className="h-4 w-4" />
                              {reschedulingInProgress === quote.id ? "Rescheduling..." : "Reschedule"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Reschedule Booking</DialogTitle>
                              <DialogDescription>
                                Select a new date and time for this appointment.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <AvailabilityCalendar
                                value={rescheduleDate}
                                onChange={(date) => {
                                  setRescheduleDate(date)
                                  setRescheduleTime("")
                                }}
                              />
                              {rescheduleDate && (
                                <AvailabilityPicker
                                  date={rescheduleDate.toISOString().split('T')[0]}
                                  value={rescheduleTime}
                                  onSelect={setRescheduleTime}
                                />
                              )}
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setReschedulingQuoteId(null)
                                    setRescheduleDate(undefined)
                                    setRescheduleTime("")
                                  }}
                                  disabled={reschedulingInProgress === quote.id}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => rescheduleBooking(quote.id, quote.bookingId)}
                                  disabled={!rescheduleDate || !rescheduleTime || reschedulingInProgress === quote.id}
                                >
                                  {reschedulingInProgress === quote.id ? "Rescheduling..." : "Reschedule"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
