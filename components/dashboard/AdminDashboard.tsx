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
  const [bookings, setBookings] = useState<Booking[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("")
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT'
  })

  useEffect(() => {
    if (user?.id) {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      const [bookingsRes, quotesRes, techniciansRes, notificationsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/quotes"),
        fetch("/api/admin/technicians"),
        fetch(`/api/admin/notifications?userId=${user.id}`)
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
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const assignTechnician = async (bookingId: string, technicianId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ technicianId }),
      })

      if (response.ok) {
        setSelectedBooking(null)
        setSelectedTechnicianId("")
        fetchAdminData() // Refresh data
      }
    } catch (error) {
      console.error("Error assigning technician:", error)
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

  const createUser = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        // Reset form and close dialog
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'CLIENT'
        });
        setShowCreateUserDialog(false);
        
        // Refresh technicians list if a technician was created
        if (newUser.role === 'TECHNICIAN') {
          fetchAdminData();
        }
        
        alert('User created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error creating user: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">All Bookings</TabsTrigger>
          <TabsTrigger value="quotes">All Quotes</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
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
                        {booking.technician && (
                          <p className="text-sm text-green-600">Assigned to: {booking.technician.name}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              {booking.assignedTechnicianId ? "Reassign" : "Assign"} Technician
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Technician to Booking</DialogTitle>
                              <DialogDescription>
                                Select a technician to assign to this booking.
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
                                disabled={!selectedTechnicianId}
                                className="w-full"
                              >
                                Assign Technician
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
                      <div className="space-y-1">
                        <p className="font-medium">Quote #{quote.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">${quote.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{quote.description}</p>
                        <p className="text-xs text-gray-500">
                          By: {quote.technician.name} - For: {quote.booking.customerName} - {new Date(quote.createdAt).toLocaleDateString()}
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

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Create and manage user accounts</CardDescription>
                </div>
                <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Create a new technician or client account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter full name"
                        />
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
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">User Role *</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CLIENT">Client</SelectItem>
                            <SelectItem value="TECHNICIAN">Technician</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={createUser}
                          disabled={!newUser.name || !newUser.email || !newUser.password}
                          className="flex-1"
                        >
                          Create User
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Technicians ({technicians.length})</h3>
                    {technicians.length === 0 ? (
                      <p className="text-sm text-gray-500">No technicians found</p>
                    ) : (
                      <div className="space-y-2">
                        {technicians.map((tech) => (
                          <div key={tech.id} className="text-sm">
                            <p className="font-medium">{tech.name}</p>
                            <p className="text-gray-600">{tech.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Clients</h3>
                    <p className="text-sm text-gray-500">Client accounts can be created through the sign-up process</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>System notifications and updates</CardDescription>
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
