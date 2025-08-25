'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = searchParams.get('quote_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Cancelled
          </CardTitle>
          <CardDescription>
            Your payment was cancelled. You can try again or contact us for assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              No charges were made to your account. Your quote is still pending approval.
            </p>
          </div>

          <div className="space-y-2">
            {quoteId && (
              <Button 
                onClick={() => router.push(`/payment/${quoteId}`)}
                className="w-full"
              >
                Try Payment Again
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
