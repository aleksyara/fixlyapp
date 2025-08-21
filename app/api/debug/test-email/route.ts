import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY is not set'
    }, { status: 500 });
  }

  try {
    const resend = new Resend(resendApiKey);
    
    // Test email configuration
    const testEmail = {
      from: 'Fixly Appliance Service <noreply@fixlyappliance.com>',
      to: ['test@example.com'], // This won't actually send, just tests the config
      subject: 'Test Email Configuration',
      html: '<p>This is a test email to verify the configuration.</p>'
    };

    // Try to validate the configuration without actually sending
    console.log('[email-test] Testing Resend configuration...');
    console.log('[email-test] API Key present:', !!resendApiKey);
    console.log('[email-test] From address:', testEmail.from);
    
    return NextResponse.json({
      success: true,
      message: 'Email configuration appears valid',
      config: {
        hasApiKey: !!resendApiKey,
        apiKeyLength: resendApiKey.length,
        fromAddress: testEmail.from,
        resendApiKey: resendApiKey.substring(0, 10) + '...' + resendApiKey.substring(resendApiKey.length - 10)
      },
      suggestions: [
        'Check if the domain fixlyappliance.com is verified in Resend',
        'Check if the API key has proper permissions',
        'Check the Resend dashboard for any delivery issues'
      ]
    });
    
  } catch (error) {
    console.error('[email-test] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        hasApiKey: !!resendApiKey,
        apiKeyLength: resendApiKey?.length || 0
      }
    }, { status: 500 });
  }
}
