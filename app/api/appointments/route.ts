import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/google-calendar'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'serviceType', 'applianceType', 'brand', 'email', 'phone', 
      'serviceAddress', 'zipCode', 'consentMarketing', 'appointmentDate', 'appointmentTime'
    ]
    
    for (const field of requiredFields) {
      if (!data[field] && field !== 'consentMarketing') {
        return NextResponse.json(`${field} is required`, { status: 400 })
      }
    }
    
    if (data.applianceType === 'Other' && !data.applianceOther) {
      return NextResponse.json('Please specify appliance type', { status: 400 })
    }
    
    if (data.brand === 'Other' && !data.brandOther) {
      return NextResponse.json('Please specify brand', { status: 400 })
    }
    
    if (!data.consentMarketing) {
      return NextResponse.json('Marketing consent is required', { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json('Please enter a valid email address', { status: 400 })
    }

    // Create appointment date
    const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}:00`)

    // Save to database
    const client = await prisma.client.create({
      data: {
        serviceType: data.serviceType,
        applianceType: data.applianceType === 'Other' ? data.applianceOther : data.applianceType,
        applianceOther: data.applianceType === 'Other' ? data.applianceOther : null,
        brand: data.brand === 'Other' ? data.brandOther : data.brand,
        brandOther: data.brand === 'Other' ? data.brandOther : null,
        serialNumber: data.serialNumber || null,
        email: data.email,
        phone: data.phone,
        serviceAddress: data.serviceAddress,
        zipCode: data.zipCode,
        consentMarketing: data.consentMarketing,
      }
    })

    // Create Google Calendar event
    try {
      await createCalendarEvent({
        serviceType: data.serviceType,
        applianceType: data.applianceType === 'Other' ? data.applianceOther : data.applianceType,
        brand: data.brand === 'Other' ? data.brandOther : data.brand,
        phone: data.phone,
        serviceAddress: data.serviceAddress,
        serialNumber: data.serialNumber,
      }, appointmentDateTime)
    } catch (calendarError) {
      console.error('Calendar event creation failed:', calendarError)
      // Continue with success response even if calendar fails
    }

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('Appointment creation error:', error)
    return NextResponse.json('Internal server error', { status: 500 })
  }
}