'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, DollarSign, FileText } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

interface Quote {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  technician: {
    name: string;
    email: string;
  };
  booking: {
    id: string;
    date: string;
    startTime: string;
    serviceType: string;
    applianceType: string;
    customerName: string;
    customerEmail: string;
    serviceAddress: string;
    phone: string;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const quoteId = params.quoteId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    fetchQuote();
  }, [isAuthenticated, quoteId]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`);
      if (response.ok) {
        const quoteData = await response.json();
        setQuote(quoteData);
      } else {
        toast.error('Quote not found');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Error loading quote');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!quote) return;

    setProcessingPayment(true);
    try {
      // Create Stripe Checkout session
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quote.id,
          amount: quote.amount,
          customerEmail: quote.booking.customerEmail,
          customerName: quote.booking.customerName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Load Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        toast.error(`Payment failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Quote not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="mt-2 text-gray-600">Complete your payment for the service quote</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quote Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quote ID:</span>
                <span className="font-mono text-sm">{quote.id.slice(-8)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-2xl font-bold text-green-600">${quote.amount.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Service Description</h3>
                <p className="text-sm text-gray-600">{quote.description}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Technician</h3>
                <p className="text-sm text-gray-600">{quote.technician.name}</p>
                <p className="text-sm text-gray-500">{quote.technician.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{quote.booking.customerName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(quote.booking.date).toLocaleDateString()} at {quote.booking.startTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{quote.booking.serviceAddress}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Type:</span>
                  <Badge variant="outline">{quote.booking.serviceType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Appliance:</span>
                  <Badge variant="outline">{quote.booking.applianceType}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment
            </CardTitle>
            <CardDescription>
              Secure payment powered by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Quote Amount:</span>
                  <span className="font-medium">${quote.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Processing Fee:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold text-green-600">${quote.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full"
                size="lg"
              >
                {processingPayment ? 'Processing Payment...' : `Pay $${quote.amount.toFixed(2)}`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Your payment is secure and encrypted. We use Stripe to process all payments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
