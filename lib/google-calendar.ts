import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

export interface AppointmentData {
  serviceType: string
  applianceType: string
  brand: string
  phone: string
  serviceAddress: string
  serialNumber?: string
}

export async function createCalendarEvent(data: AppointmentData, appointmentDate: Date) {
  try {
    const event = {
      summary: `${data.serviceType} - ${data.applianceType}`,
      description: `
Service Type: ${data.serviceType}
Appliance: ${data.applianceType}
Brand: ${data.brand}
Serial Number: ${data.serialNumber || 'N/A'}
Phone: ${data.phone}
Address: ${data.serviceAddress}
      `.trim(),
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'America/New_York',
      },
    }

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
    })

    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw new Error('Failed to create calendar event')
  }
}