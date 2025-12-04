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
      from: 'Fixly Appliance Service <noreply@fixlyappliance.com>',
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
      from: 'Fixly Appliance Service <noreply@fixlyappliance.com>',
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

export interface TechnicianAssignmentEmailData {
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  applianceType: string;
  brand: string;
  serviceAddress: string;
  phone: string;
  bookingId: string;
}

export async function sendTechnicianAssignmentNotification(data: TechnicianAssignmentEmailData) {
  const { 
    technicianName, 
    technicianEmail, 
    customerName, 
    customerEmail, 
    appointmentDate, 
    appointmentTime, 
    serviceType, 
    applianceType, 
    brand, 
    serviceAddress, 
    phone,
    bookingId
  } = data;

  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`;
  const viewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/appointment/view/${bookingId}`;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Fixly Appliance Service <noreply@fixlyappliance.com>',
      to: [technicianEmail],
      subject: `New Assignment - ${serviceType} for ${applianceType} on ${appointmentDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Assignment Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .assignment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .customer-info { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #0ea5e9; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button.secondary { background: #6b7280; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔧 New Assignment</h1>
            <p>You have been assigned a new service appointment</p>
          </div>
          
          <div class="content">
            <h2>Hello ${technicianName}!</h2>
            <p>You have been assigned a new service appointment. Please review the details below:</p>
            
            <div class="assignment-details">
              <h3>📅 Appointment Details</h3>
              <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              <p><strong>Service Type:</strong> ${serviceType}</p>
              <p><strong>Appliance:</strong> ${applianceType}</p>
              <p><strong>Brand:</strong> ${brand}</p>
              <p><strong>Service Address:</strong> ${serviceAddress}</p>
            </div>

            <div class="customer-info">
              <h4>👤 Customer Information</h4>
              <p><strong>Name:</strong> ${customerName || 'Not provided'}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <h3>Next Steps</h3>
            <p>Please review the appointment details and prepare for the service call:</p>
            
            <a href="${viewUrl}" class="button">👁️ View Full Details</a>
            <a href="${dashboardUrl}" class="button secondary">📊 Go to Dashboard</a>

            <div class="footer">
              <p><strong>Important Notes:</strong></p>
              <p>• Please arrive on time for the appointment</p>
              <p>• Contact the customer if you need to reschedule</p>
              <p>• Update the appointment status after completion</p>
              <p>• Create quotes for any additional services needed</p>
              
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
      throw new Error('Failed to send technician assignment email');
    }

    return emailData;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export async function sendAppointmentUpdateConfirmation(data: AppointmentEmailData) {
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
      from: 'Fixly Appliance Service <noreply@fixlyappliance.com>',
      to: [customerEmail],
      subject: `Appointment Updated - ${serviceType} for ${applianceType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Update Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
            .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button.danger { background: #dc2626; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
            .service-fee { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Appointment Updated</h1>
            <p>Your appliance service appointment has been successfully updated</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customerName || 'there'}!</h2>
            <p>Your appointment has been successfully updated. Here are the new details:</p>
            
            <div class="appointment-details">
              <h3>📅 Updated Appointment Details</h3>
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
            <p>You can make further changes or cancel your appointment using the links below:</p>
            
            <a href="${editUrl}" class="button">✏️ Edit Appointment</a>
            <a href="${cancelUrl}" class="button danger">❌ Cancel Appointment</a>

            <div class="footer">
              <p><strong>Need to make more changes?</strong></p>
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
      throw new Error('Failed to send update confirmation email');
    }

    return emailData;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, userName: string) {
  try {
    const resetToken = crypto.randomUUID();
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    const { data: emailData, error } = await resend.emails.send({
      from: 'Fixly Appliance Service <noreply@fixlyappliance.com>',
      to: [email],
      subject: 'Password Reset Request - Fixly Appliance Service',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
            .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Reset your Fixly Appliance Service account password</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your Fixly Appliance Service account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>

            <div class="warning">
              <h4>⚠️ Important Security Notice</h4>
              <p>• This link will expire in 1 hour for security reasons</p>
              <p>• If you didn't request this password reset, please ignore this email</p>
              <p>• Never share this link with anyone</p>
            </div>

            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>

            <div class="footer">
              <p><strong>Fixly Appliance Service</strong><br>
              Professional appliance repair and maintenance</p>
              <p>If you have any questions, please contact us at (949) 877-9522</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }

    console.log('Password reset email sent successfully');
    return emailData;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export interface FollowUpEmailData {
  customerName: string;
  customerEmail: string;
  technicianName: string;
  quoteAmount: number;
  quoteDescription: string;
  serviceType: string;
  applianceType: string;
  serviceAddress: string;
  phone: string;
  quoteId: string;
}

export async function sendFollowUpEmail(data: FollowUpEmailData) {
  const {
    customerName,
    customerEmail,
    technicianName,
    quoteAmount,
    quoteDescription,
    serviceType,
    applianceType,
    serviceAddress,
    phone,
    quoteId
  } = data;

  const quoteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/${quoteId}`;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Fixly Appliance Service <noreply@fixlyappliance.com>',
      to: [customerEmail],
      subject: `Follow-up on Your Quote - ${serviceType} for ${applianceType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Follow-up on Your Quote</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📧 Follow-up on Your Quote</h1>
            <p>Your technician is following up on your service quote</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customerName || 'there'}!</h2>
            <p>This is a follow-up from your technician <strong>${technicianName}</strong> regarding your service quote.</p>
            
            <div class="quote-details">
              <h3>💰 Quote Details</h3>
              <p><strong>Amount:</strong> $${quoteAmount.toFixed(2)}</p>
              <p><strong>Description:</strong> ${quoteDescription}</p>
              <p><strong>Service:</strong> ${serviceType} - ${applianceType}</p>
              <p><strong>Service Address:</strong> ${serviceAddress}</p>
            </div>

            <h3>Next Steps</h3>
            <p>If you have any questions about this quote or would like to proceed with the service, please don't hesitate to reach out:</p>
            
            <a href="${quoteUrl}" class="button">💳 View & Pay Quote</a>

            <div class="footer">
              <p><strong>Contact Information:</strong></p>
              <p>• <strong>Phone:</strong> ${phone}</p>
              <p>• <strong>Technician:</strong> ${technicianName}</p>
              
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
      throw new Error('Failed to send follow-up email');
    }

    return emailData;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}
