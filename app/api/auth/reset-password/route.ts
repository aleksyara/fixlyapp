import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    // Always return success to prevent email enumeration
    // Only send email if user exists
    if (user && user.email) {
      try {
        await sendPasswordResetEmail(user.email, user.name || user.email);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't expose email sending errors to client
      }
    }

    return NextResponse.json({
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
