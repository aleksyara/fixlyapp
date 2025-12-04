"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, Users, Bell, Settings, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

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
  assignedTechnicianId?: string
  technician?: {
    id: string
    name: string
    email: string
  }
}

interface Quote {
  id: string
  bookingId: string
  amount: number
  description: string
  status: string
  createdAt: string
  technician: {
    id: string
    name: string
    email: string
  }
  booking: Booking
}

interface Technician {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  technicianStatus?: string
  technicianBookings?: any[]
  quotes?: Array<{
    id: string
    status: string
    amount: number
  }>
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("")
  const [assigningTechnician, setAssigningTechnician] = useState(false)
  const [sendingFollowUp, setSendingFollowUp] = useState<string | null>(null)
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
    phone: '',
    address: ''
  })
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      const [bookingsRes, quotesRes, techniciansRes, notificationsRes, clientsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/quotes"),
        fetch("/api/admin/technicians"),
        fetch(`/api/admin/notifications?userId=${user.id}`),
        fetch("/api/admin/clients")
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json()
        setQuotes(quotesData)
      }

      if (techniciansRes.ok) {
        const techniciansData = await techniciansRes.json()
        setTechnicians(techniciansData)
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        setNotifications(notificationsData)
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const assignTechnician = async (bookingId: string, technicianId: string) => {
    if (!technicianId) {
      toast({
        title: "Error",
        description: "Please select a technician",
        variant: "destructive",
      })
      return
    }

    setAssigningTechnician(true)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ technicianId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Technician assigned successfully",
        })
        setSelectedBooking(null)
        setSelectedTechnicianId("")
        await fetchAdminData() // Refresh data
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to assign technician",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning technician:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAssigningTechnician(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: "PUT",
      })
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error("Error marking notification as read:", error)
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

  const markAllNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification =>
          fetch(`/api/admin/notifications/${notification.id}/read`, {
            method: "PUT",
          })
        )
      );
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const createUser = async () => {
    try {
      const userData = {
        ...newUser,
        name: `${newUser.firstName} ${newUser.lastName}`,
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Reset form and close dialog
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'TECHNICIAN',
          phone: '',
          address: ''
        });
        setShowCreateUserDialog(false);
        
        // Refresh technicians list if a technician was created
        if (newUser.role === 'TECHNICIAN') {
          fetchAdminData();
        }
        
        alert('Technician created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error creating technician: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating technician:', error);
      alert('Error creating technician');
    }
  };

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
      case "SUBMITTED_TO_CLIENT":
        return "bg-purple-100 text-purple-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    if (status === "SUBMITTED_TO_CLIENT") {
      return "Submitted to Client"
    }
    return status
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
      {/*<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.filter(q => q.status === "PENDING").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicians.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</div>
          </CardContent>
        </Card>
      </div>*/}

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">All Bookings</TabsTrigger>
          <TabsTrigger value="quotes">All Quotes</TabsTrigger>
          <TabsTrigger value="clients">Manage Clients</TabsTrigger>
          <TabsTrigger value="technicians">Manage Technicians</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Quotes Submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Quotes Amount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${quotes.reduce((sum, quote) => sum + quote.amount, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>Manage all customer bookings and technician assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No bookings found</p>
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
                        {booking.technician ? (
                          <p className="text-sm text-green-600">Assigned to: {booking.technician.name}</p>
                        ) : (
                          <p className="text-sm text-orange-600">No technician assigned</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {formatStatus(booking.status)}
                        </Badge>
                        {booking.status === "SUBMITTED_TO_CLIENT" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            title="Cannot reassign technician when quote has been submitted to client"
                          >
                            {booking.assignedTechnicianId ? "Reassign" : "Assign"} Technician
                          </Button>
                        ) : (
                          <Dialog 
                            open={selectedBooking?.id === booking.id} 
                            onOpenChange={(open) => {
                              if (!open) {
                                setSelectedBooking(null)
                                setSelectedTechnicianId("")
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  // Pre-populate with current technician if reassigning
                                  setSelectedTechnicianId(booking.assignedTechnicianId || "")
                                }}
                              >
                                {booking.assignedTechnicianId ? "Reassign" : "Assign"} Technician
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{booking.assignedTechnicianId ? "Reassign" : "Assign"} Technician to Booking</DialogTitle>
                              <DialogDescription>
                                Select a technician to {booking.assignedTechnicianId ? "reassign" : "assign"} to this booking.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="technician">Technician</Label>
                                <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a technician" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {technicians.map((technician) => (
                                      <SelectItem key={technician.id} value={technician.id}>
                                        {technician.name} ({technician.email})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={() => assignTechnician(booking.id, selectedTechnicianId)}
                                disabled={!selectedTechnicianId || assigningTechnician}
                                className="w-full"
                              >
                                {assigningTechnician ? "Assigning..." : booking.assignedTechnicianId ? "Reassign Technician" : "Assign Technician"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Quotes</CardTitle>
              <CardDescription>Review all quotes created by technicians</CardDescription>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No quotes found</p>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Quote #{quote.id.slice(-8)}</p>
                            <p className="text-lg font-semibold text-blue-600">${quote.amount.toFixed(2)}</p>
                          </div>
                          <Badge className={getStatusColor(quote.status)}>
                            {quote.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{quote.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t">
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
                              By: {quote.technician.name} - {new Date(quote.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Clients</CardTitle>
              <CardDescription>View all registered clients and their information</CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No clients found</p>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedClient(client)}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{client.name || client.email}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          <p className="text-sm text-gray-600">Total Bookings: {client.clientBookings?.length || 0}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Details Dialog */}
          {selectedClient && (
            <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Client Details</DialogTitle>
                  <DialogDescription>
                    Contact information and booking history
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-gray-600">{selectedClient.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-600">{selectedClient.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Bookings & Quotes</Label>
                    <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                      {!selectedClient.clientBookings || selectedClient.clientBookings.length === 0 ? (
                        <p className="text-sm text-gray-500">No bookings found</p>
                      ) : (
                        selectedClient.clientBookings.map((booking: any) => (
                          <div key={booking.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{booking.serviceType} - {booking.applianceType}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                                </p>
                                <p className="text-xs text-gray-600">{booking.serviceAddress}</p>
                                {booking.technician && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Assigned to: {booking.technician.name || booking.technician.email}
                                  </p>
                                )}
                                {!booking.assignedTechnicianId && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    No technician assigned
                                  </p>
                                )}
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {formatStatus(booking.status)}
                              </Badge>
                            </div>
                            {booking.quotes && booking.quotes.length > 0 && (
                              <div className="mt-2 pt-2 border-t space-y-2">
                                <p className="text-xs font-medium text-gray-700">Quotes ({booking.quotes.length}):</p>
                                {booking.quotes.map((quote: any) => (
                                  <div key={quote.id} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium">${quote.amount.toFixed(2)}</span>
                                      <Badge className={`text-xs ${getStatusColor(quote.status)}`}>
                                        {quote.status}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-600 mb-1">{quote.description}</p>
                                    {quote.technician && (
                                      <p className="text-gray-500">
                                        By: {quote.technician.name || quote.technician.email} - {new Date(quote.createdAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Technicians</CardTitle>
                  <CardDescription>View all technicians and their statistics</CardDescription>
                </div>
                <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add a new Tech
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Technician</DialogTitle>
                      <DialogDescription>
                        Create a new technician account with contact information.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={newUser.phone}
                          onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Input
                          id="address"
                          value={newUser.address}
                          onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={createUser}
                          disabled={!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password || !newUser.phone || !newUser.address}
                          className="flex-1"
                        >
                          Add Technician
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateUserDialog(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {technicians.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No technicians found</p>
              ) : (
                <div className="space-y-4">
                  {technicians.map((tech) => (
                    <div key={tech.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTechnician(tech)}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{tech.name}</p>
                          <p className="text-sm text-gray-600">{tech.email}</p>
                          <p className="text-sm text-gray-600">Status: {tech.technicianStatus || 'READY_TO_WORK'}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technician Details Dialog */}
          {selectedTechnician && (
            <Dialog open={!!selectedTechnician} onOpenChange={() => setSelectedTechnician(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Technician Details</DialogTitle>
                  <DialogDescription>
                    Contact information and statistics
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-gray-600">{selectedTechnician.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-600">{selectedTechnician.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-gray-600">{selectedTechnician.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-gray-600">{selectedTechnician.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={selectedTechnician.technicianStatus === 'DAY_OFF' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                        {selectedTechnician.technicianStatus || 'READY_TO_WORK'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Statistics</Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedTechnician.technicianBookings?.length || 0}</p>
                        <p className="text-xs text-gray-600">Total Bookings</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{selectedTechnician.quotes?.length || 0}</p>
                        <p className="text-xs text-gray-600">Total Quotes</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedTechnician.quotes?.filter((q: any) => q.status === 'PAID').length || 0}
                        </p>
                        <p className="text-xs text-gray-600">Paid Quotes</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                          ${(selectedTechnician.quotes?.reduce((sum: number, q: any) => sum + (q.amount || 0), 0) || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">Total Quotes Amount</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>System notifications and updates</CardDescription>
                </div>
                {notifications.filter(n => !n.read).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No notifications found</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Badge className="bg-blue-100 text-blue-800">New</Badge>
                        )}
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
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
