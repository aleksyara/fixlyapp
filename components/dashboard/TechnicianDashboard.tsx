"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import TechnicianCalendar from "@/components/TechnicianCalendar"

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
  const [bookings, setBookings] = useState<Booking[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
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
        setBookings(bookingsData)
      }

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json()
        setQuotes(quotesData)
      }
    } catch (error) {
      console.error("Error fetching technician data:", error)
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
      }
    } catch (error) {
      console.error("Error creating quote:", error)
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Assigned: <span className="font-bold text-lg">{bookings.length}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Pending: <span className="font-bold text-lg">{quotes.filter(q => q.status === "PENDING").length}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Completed: <span className="font-bold text-lg">
            {bookings.filter(b => b.status === "COMPLETED" && new Date(b.date).toDateString() === new Date().toDateString()).length}
          </span></span>
        </div>
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
                    <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Quote #{quote.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">${quote.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{quote.description}</p>
                        <p className="text-xs text-gray-500">
                          For: {quote.booking.customerName} - {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
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
