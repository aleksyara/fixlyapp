import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface AppointmentEmailData {
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  applianceType: string;
  brand: string;
  serviceAddress: string;
  phone: string;
  eventId: string;
  bookingId: string;
}

export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  const { 
    customerName, 
    customerEmail, 
    appointmentDate, 
    appointmentTime, 
    serviceType, 
    applianceType, 
    brand, 
    serviceAddress, 
    phone,
    eventId,
    bookingId
  } = data;

  const editUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/appointment/edit/${bookingId}`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/appointment/cancel/${bookingId}`;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Fixly Appliance Service <noreply@fixlyappliances.com>',
      to: [customerEmail],
      subject: `Appointment Confirmed - ${serviceType} for ${applianceType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button.danger { background: #dc2626; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
            .service-fee { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Appointment Confirmed</h1>
            <p>Your appliance service appointment has been scheduled</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customerName || 'there'}!</h2>
            <p>Your appointment has been successfully booked. Here are the details:</p>
            
            <div class="appointment-details">
              <h3>📅 Appointment Details</h3>
              <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              <p><strong>Service:</strong> ${serviceType}</p>
              <p><strong>Appliance:</strong> ${applianceType}</p>
              <p><strong>Brand:</strong> ${brand}</p>
              <p><strong>Address:</strong> ${serviceAddress}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <div class="service-fee">
              <h4>💰 Service Call Fee</h4>
              <p><strong>$80.00</strong> (Orange County rate)</p>
              <p>Payment will be collected at the time of service.</p>
            </div>

            <h3>Manage Your Appointment</h3>
            <p>You can edit or cancel your appointment using the links below:</p>
            
            <a href="${editUrl}" class="button">✏️ Edit Appointment</a>
            <a href="${cancelUrl}" class="button danger">❌ Cancel Appointment</a>

            <div class="footer">
              <p><strong>Need to make changes?</strong></p>
              <p>• <strong>Edit:</strong> Change date, time, or service details</p>
              <p>• <strong>Cancel:</strong> Cancel your appointment (24-hour notice required)</p>
              <p>• <strong>Contact:</strong> Call us at (949) 877-9522 for urgent changes</p>
              
              <p style="margin-top: 20px;">
                <strong>Fixly Appliance Service</strong><br>
                Professional appliance installation and repair<br>
                Phone: (949) 877-9522<br>
                Email: fixlyappliances@gmail.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send confirmation email');
    }

    return emailData;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export async function sendAppointmentCancellation(data: AppointmentEmailData) {
  const { 
    customerName, 
    customerEmail, 
    appointmentDate, 
    appointmentTime, 
    serviceType, 
    applianceType 
  } = data;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Fixly Appliance Service <noreply@fixlyappliances.com>',
      to: [customerEmail],
      subject: `Appointment Cancelled - ${serviceType} for ${applianceType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Cancellation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>❌ Appointment Cancelled</h1>
            <p>Your appointment has been successfully cancelled</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customerName || 'there'}!</h2>
            <p>Your appointment has been cancelled as requested. Here are the details of the cancelled appointment:</p>
            
            <div class="appointment-details">
              <h3>📅 Cancelled Appointment</h3>
              <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              <p><strong>Service:</strong> ${serviceType}</p>
              <p><strong>Appliance:</strong> ${applianceType}</p>
            </div>

            <h3>Need to reschedule?</h3>
            <p>If you'd like to book a new appointment, please visit our booking page:</p>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/book" class="button">📅 Book New Appointment</a>

            <div class="footer">
              <p><strong>Questions?</strong></p>
              <p>Contact us at (949) 877-9522 or fixlyappliances@gmail.com</p>
              
              <p style="margin-top: 20px;">
                <strong>Fixly Appliance Service</strong><br>
                Professional appliance installation and repair<br>
                Phone: (949) 877-9522<br>
                Email: fixlyappliances@gmail.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send cancellation email');
    }

    return emailData;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}
