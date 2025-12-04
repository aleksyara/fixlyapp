import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      include: {
        clientBookings: {
          include: {
            quotes: {
              include: {
                technician: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            technician: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // For each client, also fetch bookings by email (in case clientId wasn't set)
    const clientsWithAllBookings = await Promise.all(
      clients.map(async (client) => {
        if (!client.email) return client
        
        // Fetch all bookings for this email (including those without clientId)
        const bookingsByEmail = await prisma.booking.findMany({
          where: {
            customerEmail: client.email,
          },
          include: {
            quotes: {
              include: {
                technician: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            technician: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        })

        // Merge bookings - use bookingsByEmail as the source of truth
        // Remove duplicates by booking ID
        const allBookings = bookingsByEmail
        const uniqueBookings = Array.from(
          new Map(allBookings.map(booking => [booking.id, booking])).values()
        )

        return {
          ...client,
          clientBookings: uniqueBookings,
        }
      })
    )
    
    return NextResponse.json(clientsWithAllBookings)
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}