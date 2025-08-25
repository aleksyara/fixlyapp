'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const sessionId = searchParams.get('session_id');
  const quoteId = searchParams.get('quote_id');

  useEffect(() => {
    if (sessionId && quoteId) {
      processPayment();
    } else {
      setLoading(false);
    }
  }, [sessionId, quoteId]);

  const processPayment = async () => {
    setProcessing(true);
    try {
      // Update quote status to PAID
      const response = await fetch(`/api/quotes/${quoteId}/paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Payment processed successfully!');
      } else {
        toast.error('Error processing payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error processing payment');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Your payment has been processed and your quote has been approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {processing && (
            <div className="text-center text-sm text-gray-600">
              Processing your payment...
            </div>
          )}
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              Thank you for your payment. Your technician will be notified and will contact you soon to schedule the service.
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/book')}
              className="w-full"
            >
              Book Another Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
