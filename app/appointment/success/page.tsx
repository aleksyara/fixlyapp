import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Appointment Updated!</CardTitle>
          <CardDescription>
            Your appointment has been successfully updated. You'll receive a confirmation email shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Check your email for the updated appointment details.
            </p>
            <p className="text-sm text-muted-foreground">
              If you need to make any other changes, please contact us at (949) 877-9522.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/book">
                Book Another Appointment
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
