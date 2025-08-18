'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Search, Users, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Client {
  id: string
  serviceType: string
  applianceType: string
  brand: string
  email: string
  phone: string
  serviceAddress: string
  zipCode: string
  consentMarketing: boolean
  createdAt: string
}

export default function MarketingAdmin() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [applianceFilter, setApplianceFilter] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        setAuthenticated(true)
        setLoginError('')
        fetchClients()
      } else {
        setLoginError('Invalid credentials')
      }
    } catch (error) {
      setLoginError('Login failed')
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients')
      if (response.ok) {
        const data = await response.json()
        // Only show clients who consented to marketing
        const consentedClients = data.filter((client: Client) => client.consentMarketing)
        setClients(consentedClients)
        setFilteredClients(consentedClients)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = searchTerm === '' || 
        client.phone.includes(searchTerm) ||
        client.serviceAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.applianceType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesServiceType = serviceTypeFilter === '' || client.serviceType === serviceTypeFilter
      const matchesAppliance = applianceFilter === '' || client.applianceType === applianceFilter
      
      return matchesSearch && matchesServiceType && matchesAppliance
    })
    
    setFilteredClients(filtered)
  }, [searchTerm, serviceTypeFilter, applianceFilter, clients])

  const exportToCSV = () => {
    const headers = ['Email', 'Phone', 'Service Address', 'Zip Code', 'Service Type', 'Appliance Type', 'Brand', 'Date']
    const csvData = filteredClients.map(client => [
      client.email,
      client.phone,
      client.serviceAddress,
      client.zipCode,
      client.serviceType,
      client.applianceType,
      client.brand,
      new Date(client.createdAt).toLocaleDateString()
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marketing-contacts-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the marketing dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Dashboard</h1>
          <p className="text-gray-600">Manage client contacts who have consented to marketing communications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{filteredClients.length}</p>
                <p className="text-gray-600">Total Contacts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Marketing Contacts</CardTitle>
                <CardDescription>Clients who have consented to marketing communications</CardDescription>
              </div>
              <Button onClick={exportToCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by email, phone, address, or appliance..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Services</SelectItem>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                </SelectContent>
              </Select>
              <Select value={applianceFilter} onValueChange={setApplianceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by appliance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Appliances</SelectItem>
                  <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                  <SelectItem value="Dishwasher">Dishwasher</SelectItem>
                  <SelectItem value="Washing Machine">Washing Machine</SelectItem>
                  <SelectItem value="Dryer">Dryer</SelectItem>
                  <SelectItem value="Oven">Oven</SelectItem>
                  <SelectItem value="Microwave">Microwave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Service Address</TableHead>
                    <TableHead>Zip Code</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Appliance</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Date Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.email}</TableCell>
                      <TableCell className="font-mono">{client.phone}</TableCell>
                      <TableCell>{client.serviceAddress}</TableCell>
                      <TableCell>{client.zipCode}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          client.serviceType === 'Installation' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {client.serviceType}
                        </span>
                      </TableCell>
                      <TableCell>{client.applianceType}</TableCell>
                      <TableCell>{client.brand}</TableCell>
                      <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredClients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No contacts found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}