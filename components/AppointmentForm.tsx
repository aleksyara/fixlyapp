// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { CalendarDays, Clock, MapPin, Phone, Wrench } from 'lucide-react'
// import { Mail } from 'lucide-react'
// import { toast } from 'sonner'

// interface FormData {
//   serviceType: string
//   applianceType: string
//   applianceOther: string
//   brand: string
//   brandOther: string
//   serialNumber: string
//   email: string
//   phone: string
//   serviceAddress: string
//   zipCode: string
//   consentMarketing: boolean
//   appointmentDate: string
//   appointmentTime: string
// }

// const serviceTypes = ['Installation', 'Repair']
// const applianceTypes = [
//   'Refrigerator', 'Dishwasher', 'Washing Machine', 'Dryer', 
//   'Oven', 'Microwave', 'Garbage Disposal', 'Other'
// ]
// const brands = [
//   'Whirlpool', 'GE', 'Samsung', 'LG', 'Maytag', 
//   'KitchenAid', 'Frigidaire', 'Bosch', 'Other'
// ]

// export default function AppointmentForm() {
//   const [formData, setFormData] = useState<FormData>({
//     serviceType: '',
//     applianceType: '',
//     applianceOther: '',
//     brand: '',
//     brandOther: '',
//     serialNumber: '',
//     email: '',
//     phone: '',
//     serviceAddress: '',
//     zipCode: '',
//     consentMarketing: false,
//     appointmentDate: '',
//     appointmentTime: '',
//   })
  
//   const [loading, setLoading] = useState(false)
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {}

//     if (!formData.serviceType) newErrors.serviceType = 'Service type is required'
//     if (!formData.applianceType) newErrors.applianceType = 'Appliance type is required'
//     if (formData.applianceType === 'Other' && !formData.applianceOther) {
//       newErrors.applianceOther = 'Please specify appliance type'
//     }
//     if (!formData.brand) newErrors.brand = 'Brand is required'
//     if (formData.brand === 'Other' && !formData.brandOther) {
//       newErrors.brandOther = 'Please specify brand'
//     }
//     if (!formData.email) newErrors.email = 'Email is required'
//     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address'
//     }
//     if (!formData.phone) newErrors.phone = 'Phone number is required'
//     if (!formData.serviceAddress) newErrors.serviceAddress = 'Service address is required'
//     if (!formData.zipCode) newErrors.zipCode = 'Zip code is required'
//     if (!formData.consentMarketing) newErrors.consentMarketing = 'Consent is required'
//     if (!formData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required'
//     if (!formData.appointmentTime) newErrors.appointmentTime = 'Appointment time is required'

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!validateForm()) return

//     setLoading(true)
    
//     try {
//       const response = await fetch('/api/appointments', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       })

//       if (response.ok) {
//         toast.success('Appointment booked successfully!')
//         setFormData({
//           serviceType: '',
//           applianceType: '',
//           applianceOther: '',
//           brand: '',
//           brandOther: '',
//           serialNumber: '',
//           email: '',
//           phone: '',
//           serviceAddress: '',
//           zipCode: '',
//           consentMarketing: false,
//           appointmentDate: '',
//           appointmentTime: '',
//         })
//       } else {
//         const error = await response.text()
//         toast.error(error || 'Failed to book appointment')
//       }
//     } catch (error) {
//       toast.error('An error occurred. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateFormData = (field: keyof FormData, value: string | boolean) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }))
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
//       <div className="max-w-2xl mx-auto">
//         <Card className="shadow-xl border-0">
//           <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
//             <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
//               <Wrench className="h-8 w-8" />
//               Book Your Service
//             </CardTitle>
//             <CardDescription className="text-blue-100 text-lg">
//               Schedule your appliance installation or repair
//             </CardDescription>
//           </CardHeader>
          
//           <CardContent className="p-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="serviceType" className="text-sm font-semibold text-gray-700">
//                     Service Type <span className="text-red-500">*</span>
//                   </Label>
//                   <Select value={formData.serviceType} onValueChange={(value) => updateFormData('serviceType', value)}>
//                     <SelectTrigger className={errors.serviceType ? 'border-red-500' : ''}>
//                       <SelectValue placeholder="Select service type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {serviceTypes.map(type => (
//                         <SelectItem key={type} value={type}>{type}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {errors.serviceType && <p className="text-red-500 text-sm">{errors.serviceType}</p>}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="applianceType" className="text-sm font-semibold text-gray-700">
//                     Appliance Type <span className="text-red-500">*</span>
//                   </Label>
//                   <Select value={formData.applianceType} onValueChange={(value) => updateFormData('applianceType', value)}>
//                     <SelectTrigger className={errors.applianceType ? 'border-red-500' : ''}>
//                       <SelectValue placeholder="Select appliance type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {applianceTypes.map(type => (
//                         <SelectItem key={type} value={type}>{type}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {errors.applianceType && <p className="text-red-500 text-sm">{errors.applianceType}</p>}
//                 </div>
//               </div>

//               {formData.applianceType === 'Other' && (
//                 <div className="space-y-2">
//                   <Label htmlFor="applianceOther" className="text-sm font-semibold text-gray-700">
//                     Specify Appliance Type <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     value={formData.applianceOther}
//                     onChange={(e) => updateFormData('applianceOther', e.target.value)}
//                     placeholder="Please specify"
//                     className={errors.applianceOther ? 'border-red-500' : ''}
//                   />
//                   {errors.applianceOther && <p className="text-red-500 text-sm">{errors.applianceOther}</p>}
//                 </div>
//               )}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">
//                     Brand <span className="text-red-500">*</span>
//                   </Label>
//                   <Select value={formData.brand} onValueChange={(value) => updateFormData('brand', value)}>
//                     <SelectTrigger className={errors.brand ? 'border-red-500' : ''}>
//                       <SelectValue placeholder="Select brand" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {brands.map(brand => (
//                         <SelectItem key={brand} value={brand}>{brand}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="serialNumber" className="text-sm font-semibold text-gray-700">
//                     Serial Number
//                   </Label>
//                   <Input
//                     value={formData.serialNumber}
//                     onChange={(e) => updateFormData('serialNumber', e.target.value)}
//                     placeholder="Optional"
//                   />
//                 </div>
//               </div>

//               {formData.brand === 'Other' && (
//                 <div className="space-y-2">
//                   <Label htmlFor="brandOther" className="text-sm font-semibold text-gray-700">
//                     Specify Brand <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     value={formData.brandOther}
//                     onChange={(e) => updateFormData('brandOther', e.target.value)}
//                     placeholder="Please specify"
//                     className={errors.brandOther ? 'border-red-500' : ''}
//                   />
//                   {errors.brandOther && <p className="text-red-500 text-sm">{errors.brandOther}</p>}
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Mail className="h-4 w-4" />
//                   Email Address <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => updateFormData('email', e.target.value)}
//                   placeholder="your.email@example.com"
//                   className={errors.email ? 'border-red-500' : ''}
//                 />
//                 {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                 <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Phone className="h-4 w-4" />
//                   Phone Number <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => updateFormData('phone', e.target.value)}
//                   placeholder="(555) 123-4567"
//                   className={errors.phone ? 'border-red-500' : ''}
//                 />
//                 {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
//               </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700">
//                     Zip Code <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     value={formData.zipCode}
//                     onChange={(e) => updateFormData('zipCode', e.target.value)}
//                     placeholder="12345"
//                     maxLength={10}
//                     className={errors.zipCode ? 'border-red-500' : ''}
//                   />
//                   {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="serviceAddress" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <MapPin className="h-4 w-4" />
//                   Service Address <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   value={formData.serviceAddress}
//                   onChange={(e) => updateFormData('serviceAddress', e.target.value)}
//                   placeholder="123 Main St, City, State"
//                   className={errors.serviceAddress ? 'border-red-500' : ''}
//                 />
//                 {errors.serviceAddress && <p className="text-red-500 text-sm">{errors.serviceAddress}</p>}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="appointmentDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <CalendarDays className="h-4 w-4" />
//                     Preferred Date <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     type="date"
//                     value={formData.appointmentDate}
//                     onChange={(e) => updateFormData('appointmentDate', e.target.value)}
//                     min={new Date().toISOString().split('T')[0]}
//                     className={errors.appointmentDate ? 'border-red-500' : ''}
//                   />
//                   {errors.appointmentDate && <p className="text-red-500 text-sm">{errors.appointmentDate}</p>}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="appointmentTime" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Clock className="h-4 w-4" />
//                     Preferred Time <span className="text-red-500">*</span>
//                   </Label>
//                   <Select value={formData.appointmentTime} onValueChange={(value) => updateFormData('appointmentTime', value)}>
//                     <SelectTrigger className={errors.appointmentTime ? 'border-red-500' : ''}>
//                       <SelectValue placeholder="Select time" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="09:00">9:00 AM</SelectItem>
//                       <SelectItem value="10:00">10:00 AM</SelectItem>
//                       <SelectItem value="11:00">11:00 AM</SelectItem>
//                       <SelectItem value="13:00">1:00 PM</SelectItem>
//                       <SelectItem value="14:00">2:00 PM</SelectItem>
//                       <SelectItem value="15:00">3:00 PM</SelectItem>
//                       <SelectItem value="16:00">4:00 PM</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {errors.appointmentTime && <p className="text-red-500 text-sm">{errors.appointmentTime}</p>}
//                 </div>
//               </div>

//               <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
//                 <Checkbox
//                   id="consent"
//                   checked={formData.consentMarketing}
//                   onCheckedChange={(checked) => updateFormData('consentMarketing', !!checked)}
//                   className={errors.consentMarketing ? 'border-red-500' : ''}
//                 />
//                 <div className="space-y-1">
//                   <Label
//                     htmlFor="consent"
//                     className="text-sm font-medium leading-5 cursor-pointer"
//                   >
//                     Marketing Consent <span className="text-red-500">*</span>
//                   </Label>
//                   <p className="text-sm text-gray-600">
//                     I consent to receiving marketing communications including service reminders, 
//                     promotional offers, and company updates via phone, email, or text message. 
//                     I understand I can opt out at any time.
//                   </p>
//                   {errors.consentMarketing && <p className="text-red-500 text-sm">{errors.consentMarketing}</p>}
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg transition-all duration-200 transform hover:scale-[1.02]"
//               >
//                 {loading ? 'Booking Appointment...' : 'Book Appointment'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
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

interface FormData {
  serviceType: string;
  applianceType: string;
  applianceOther: string;
  brand: string;
  brandOther: string;
  serialNumber: string;
  email: string;
  phone: string;
  serviceAddress: string;
  zipCode: string;
  consentMarketing: boolean;
  appointmentDate: string;
  appointmentTime: string;
}

const serviceTypes = ['Installation', 'Repair'];
const applianceTypes = ['Refrigerator','Dishwasher','Washing Machine','Dryer','Oven','Microwave','Garbage Disposal','Other'];
const brands = ['Whirlpool','GE','Samsung','LG','Maytag','KitchenAid','Frigidaire','Bosch','Other'];

export default function AppointmentForm() {
  const [formData, setFormData] = useState<FormData>({
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
  });

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
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.serviceAddress) newErrors.serviceAddress = 'Service address is required';
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
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
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
                  <Label htmlFor="serviceType" className="text-sm font-semibold text-gray-700">
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
                  <Label htmlFor="applianceType" className="text-sm font-semibold text-gray-700">
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
                  <Label htmlFor="applianceOther" className="text-sm font-semibold text-gray-700">
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
                  <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">
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
                  <Label htmlFor="serialNumber" className="text-sm font-semibold text-gray-700">
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
                  <Label htmlFor="brandOther" className="text-sm font-semibold text-gray-700">
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
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateFormData('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`text-base ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700">
                    Zip Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.zipCode}
                    onChange={e => updateFormData('zipCode', e.target.value)}
                    placeholder="12345"
                    maxLength={10}
                    className={`text-base ${errors.zipCode ? 'border-red-500' : ''}`}
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceAddress" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                  <Label htmlFor="appointmentDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                  <Label htmlFor="appointmentTime" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
