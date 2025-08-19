'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin, Phone, Wrench, Mail } from 'lucide-react';
import { toast } from 'sonner';
import useServiceFee from '../hooks/useServiceFee';
import { normalizeZip, normalizePhone } from '@/lib/zipUtils';

interface FormData {
  serviceType: string;
  applianceType: string;
  applianceOther: string;
  brand: string;
  brandOther: string;
  serialNumber: string;
  email: string;
  phone: string;          // digits only (max 10)
  serviceAddress: string;
  zipCode: string;        // digits only (max 5)
  consentMarketing: boolean;
  appointmentDate: string;
  appointmentTime: string;
  serviceFee?: number;    // computed from zip
}

const serviceTypes = ['Repair', 'Installation'];
const applianceTypes = ['Refrigerator','Dishwasher','Washing Machine','Dryer','Oven','Microwave','Garbage Disposal','Other'];
const brands = ['Whirlpool','GE','Samsung','LG','Maytag','KitchenAid','Frigidaire','Bosch','Other'];

const DEFAULTS = {
  serviceType: "Repair",
  applianceType: "Washing Machine",
  brand: "Samsung",
  appointmentTime: "10:00",
} as const;

export default function AppointmentForm() {
  const [formData, setFormData] = useState<FormData>({
    serviceType: DEFAULTS.serviceType,
    applianceType: DEFAULTS.applianceType,
    applianceOther: '',
    brand: '',
    brandOther: '',
    serialNumber: '',
    email: '',
    phone: '',
    serviceAddress: '',
    zipCode: '',
    consentMarketing: false,
    appointmentDate: '',
    appointmentTime: DEFAULTS.appointmentTime,
  });

  // Use the hook (don’t recompute serviceFee locally)
  const { zip, valid, fee, isOC } = useServiceFee(formData.zipCode);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    if (!formData.applianceType) newErrors.applianceType = 'Appliance type is required';
    if (formData.applianceType === 'Other' && !formData.applianceOther) newErrors.applianceOther = 'Please specify appliance type';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (formData.brand === 'Other' && !formData.brandOther) newErrors.brandOther = 'Please specify brand';

    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';

    const phone = normalizePhone(formData.phone);
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (phone.length !== 10) newErrors.phone = 'Enter a 10‑digit phone number';

    const z = normalizeZip(formData.zipCode);
    if (!z) newErrors.zipCode = 'Zip code is required';
    else if (z.length !== 5) newErrors.zipCode = 'Enter a 5‑digit ZIP code';

    if (!formData.serviceAddress) newErrors.serviceAddress = 'Service address is required';

    if (!formData.consentMarketing) newErrors.consentMarketing = 'Consent is required';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Appointment time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload: FormData = {
        ...formData,
        phone: normalizePhone(formData.phone),
        zipCode: normalizeZip(formData.zipCode),
        serviceFee: fee, // from hook
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Appointment booked successfully!');
        setFormData({
          serviceType: '',
          applianceType: '',
          applianceOther: '',
          brand: '',
          brandOther: '',
          serialNumber: '',
          email: '',
          phone: '',
          serviceAddress: '',
          zipCode: '',
          consentMarketing: false,
          appointmentDate: '',
          appointmentTime: '',
          serviceFee: undefined,
        });
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to book appointment');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    if (field === 'zipCode' && typeof value === 'string') value = normalizeZip(value);
    if (field === 'phone' && typeof value === 'string') value = normalizePhone(value);

    setFormData(prev => ({ ...prev, [field]: value as any }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
              <Wrench className="h-7 w-7 sm:h-8 sm:w-8" />
              Book Your Service
            </CardTitle>
            <CardDescription className="text-blue-100 text-base sm:text-lg">
              Schedule your appliance installation or repair
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.serviceType} onValueChange={v => updateFormData('serviceType', v)}>
                    <SelectTrigger className={`text-base ${errors.serviceType ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceType && <p className="text-red-500 text-sm">{errors.serviceType}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Appliance Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.applianceType} onValueChange={v => updateFormData('applianceType', v)}>
                    <SelectTrigger className={`text-base ${errors.applianceType ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select appliance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {applianceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.applianceType && <p className="text-red-500 text-sm">{errors.applianceType}</p>}
                </div>
              </div>

              {formData.applianceType === 'Other' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Specify Appliance Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.applianceOther}
                    onChange={e => updateFormData('applianceOther', e.target.value)}
                    placeholder="Please specify"
                    className={`text-base ${errors.applianceOther ? 'border-red-500' : ''}`}
                  />
                  {errors.applianceOther && <p className="text-red-500 text-sm">{errors.applianceOther}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Brand <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.brand} onValueChange={v => updateFormData('brand', v)}>
                    <SelectTrigger className={`text-base ${errors.brand ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Serial Number
                  </Label>
                  <Input
                    value={formData.serialNumber}
                    onChange={e => updateFormData('serialNumber', e.target.value)}
                    placeholder="Optional"
                    className="text-base"
                  />
                </div>
              </div>

              {formData.brand === 'Other' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Specify Brand <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.brandOther}
                    onChange={e => updateFormData('brandOther', e.target.value)}
                    placeholder="Please specify"
                    className={`text-base ${errors.brandOther ? 'border-red-500' : ''}`}
                  />
                  {errors.brandOther && <p className="text-red-500 text-sm">{errors.brandOther}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => updateFormData('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className={`text-base ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={e => updateFormData('phone', e.target.value)}
                    placeholder="10 digits"
                    maxLength={10}
                    className={`text-base ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Zip Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    inputMode="numeric"
                    value={formData.zipCode}
                    onChange={e => updateFormData('zipCode', e.target.value)}
                    placeholder="5 digits"
                    maxLength={5}
                    className={`text-base ${errors.zipCode ? 'border-red-500' : ''}`}
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                </div>
              </div>

              {/* Service Fee Summary */}
              {valid && (
                <div className="rounded-lg border p-3 bg-gray-50">
                  <p className="text-sm text-gray-700">
                    Service Call Fee: <span className="font-semibold">${fee?.toFixed(2)}</span>
                    {isOC ? (
                      <span className="ml-2 text-green-700">(Orange County rate)</span>
                    ) : (
                      <span className="ml-2 text-gray-600">(Outside Orange County)</span>
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Service Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.serviceAddress}
                  onChange={e => updateFormData('serviceAddress', e.target.value)}
                  placeholder="123 Main St, City, State"
                  className={`text-base ${errors.serviceAddress ? 'border-red-500' : ''}`}
                />
                {errors.serviceAddress && <p className="text-red-500 text-sm">{errors.serviceAddress}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Preferred Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={e => updateFormData('appointmentDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`text-base ${errors.appointmentDate ? 'border-red-500' : ''}`}
                  />
                  {errors.appointmentDate && <p className="text-red-500 text-sm">{errors.appointmentDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Preferred Time <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.appointmentTime} onValueChange={v => updateFormData('appointmentTime', v)}>
                    <SelectTrigger className={`text-base ${errors.appointmentTime ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.appointmentTime && <p className="text-red-500 text-sm">{errors.appointmentTime}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="consent"
                  checked={formData.consentMarketing}
                  onCheckedChange={checked => updateFormData('consentMarketing', !!checked)}
                  className={errors.consentMarketing ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <Label htmlFor="consent" className="text-sm font-medium leading-5 cursor-pointer">
                    Marketing Consent <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600">
                    I consent to receiving marketing communications including service reminders, promotional offers, and company updates via phone, email, or text message. I understand I can opt out at any time.
                  </p>
                  {errors.consentMarketing && <p className="text-red-500 text-sm">{errors.consentMarketing}</p>}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-base sm:text-lg transition-all duration-200"
              >
                {loading ? 'Booking Appointment...' : 'Book Appointment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
