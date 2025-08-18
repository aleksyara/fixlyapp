// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Wrench, Clock, Shield, Star, Phone, MapPin, Mail } from 'lucide-react'
// import Link from 'next/link'

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Wrench className="h-8 w-8 text-blue-600" />
//               <span className="text-2xl font-bold text-gray-900">FixlyAppliance</span>
//             </div>
//             <div className="flex items-center space-x-6">
//               <div className="flex items-center space-x-2 text-gray-600">
//                 <Phone className="h-4 w-4" />
//                 <span>(949) 414-9956</span>
//               </div>
//               <Link href="/book">
//                 <Button className="bg-blue-600 hover:bg-blue-700">
//                   Book Appointment
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto text-center">
//           <h1 className="text-5xl font-bold text-gray-900 mb-6">
//             Professional Appliance
//             <span className="text-blue-600"> Installation & Repair</span>
//           </h1>
//           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
//             Expert technicians providing reliable appliance services for your home. 
//             From installations to repairs, we've got you covered with professional service you can trust.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link href="/book">
//               <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
//                 Book Appointment
//               </Button>
//             </Link>
//             <Button size="lg" variant="outline" className="text-lg px-8 py-4">
//               Call (949) 414-9956
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
//             <p className="text-lg text-gray-600">Professional appliance services for your home</p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <Card className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Wrench className="h-6 w-6 text-blue-600" />
//                   Installation Services
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 mb-4">
//                   Professional installation of new appliances including refrigerators, dishwashers, 
//                   washing machines, dryers, ovens, and more.
//                 </p>
//                 <ul className="space-y-2 text-sm text-gray-600">
//                   <li>• Refrigerators & Freezers</li>
//                   <li>• Dishwashers</li>
//                   <li>• Washing Machines & Dryers</li>
//                   <li>• Ovens & Microwaves</li>
//                   <li>• Garbage Disposals</li>
//                 </ul>
//               </CardContent>
//             </Card>

//             <Card className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Shield className="h-6 w-6 text-green-600" />
//                   Repair Services
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 mb-4">
//                   Expert repair services for all major appliance brands. Quick diagnosis 
//                   and reliable fixes to get your appliances running like new.
//                 </p>
//                 <ul className="space-y-2 text-sm text-gray-600">
//                   <li>• Diagnostic Services</li>
//                   <li>• Parts Replacement</li>
//                   <li>• Maintenance Services</li>
//                   <li>• Emergency Repairs</li>
//                   <li>• Warranty Work</li>
//                 </ul>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FixlyAppliance?</h2>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Clock className="h-8 w-8 text-blue-600" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Same Day Service</h3>
//               <p className="text-gray-600">
//                 Quick response times with same-day service available for urgent repairs.
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Shield className="h-8 w-8 text-green-600" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Licensed & Insured</h3>
//               <p className="text-gray-600">
//                 Fully licensed and insured technicians for your peace of mind.
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Star className="h-8 w-8 text-yellow-600" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">5-Star Service</h3>
//               <p className="text-gray-600">
//                 Highly rated service with satisfied customers throughout the area.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl font-bold text-white mb-4">
//             Ready to Schedule Your Service?
//           </h2>
//           <p className="text-xl text-blue-100 mb-8">
//             Book your appointment today and get professional appliance service from trusted experts.
//           </p>
//           <Link href="/book">
//             <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
//               Book Appointment Now
//             </Button>
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <div className="flex items-center space-x-2 mb-4">
//                 <Wrench className="h-6 w-6 text-blue-400" />
//                 <span className="text-xl font-bold">FixlyAppliance</span>
//               </div>
//               <p className="text-gray-400">
//                 Professional appliance installation and repair services for your home.
//               </p>
//             </div>
            
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
//               <div className="space-y-2 text-gray-400">
//                 <div className="flex items-center space-x-2">
//                   <Phone className="h-4 w-4" />
//                   <span>(949) 414-9956</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Mail className="h-4 w-4" />
//                   <span>fixlyappliances@gmail.com</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <MapPin className="h-4 w-4" />
//                   <span>Serving Your Local Area</span>
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Services</h3>
//               <ul className="space-y-2 text-gray-400">
//                 <li>Appliance Installation</li>
//                 <li>Appliance Repair</li>
//                 <li>Emergency Service</li>
//                 <li>Maintenance Plans</li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
//             <p>&copy; 2025 FixlyAppliance. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Clock, Shield, Star, Phone, MapPin, Mail } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FixlyAppliance</span>
            </div>

            {/* Right side stacks on mobile */}
            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              <a href="tel:19494149956" className="inline-flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                <Phone className="h-4 w-4" />
                <span>(949) 414-9956</span>
              </a>
              <Link href="/book" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">Book Appointment</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="font-extrabold leading-tight text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            Professional Appliance{" "}
            <span className="text-blue-600 block">Installation &amp; Repair</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-prose mx-auto">
            Expert technicians providing reliable appliance services for your home. From installations to repairs, we’ve got you covered with professional service you can trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Book Appointment
              </Button>
            </Link>
            <a href="tel:19494149956" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Call (949) 414-9956
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Our Services</h2>
            <p className="text-sm sm:text-lg text-gray-600">Professional appliance services for your home</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-blue-600" />
                  Installation Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Professional installation of new appliances including refrigerators, dishwashers,
                  washing machines, dryers, ovens, and more.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Refrigerators &amp; Freezers</li>
                  <li>• Dishwashers</li>
                  <li>• Washing Machines &amp; Dryers</li>
                  <li>• Ovens &amp; Microwaves</li>
                  <li>• Garbage Disposals</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  Repair Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Expert repair services for all major appliance brands. Quick diagnosis and reliable fixes
                  to get your appliances running like new.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Diagnostic Services</li>
                  <li>• Parts Replacement</li>
                  <li>• Maintenance Services</li>
                  <li>• Emergency Repairs</li>
                  <li>• Warranty Work</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Choose FixlyAppliance?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Same Day Service</h3>
              <p className="text-gray-600">Quick response times with same-day service available for urgent repairs.</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Licensed &amp; Insured</h3>
              <p className="text-gray-600">Fully licensed and insured technicians for your peace of mind.</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">5-Star Service</h3>
              <p className="text-gray-600">Highly rated service with satisfied customers throughout the area.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to Schedule Your Service?</h2>
          <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8">
            Book your appointment today and get professional appliance service from trusted experts.
          </p>
          <Link href="/book">
            <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              Book Appointment Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">FixlyAppliance</span>
              </div>
              <p className="text-gray-400">
                Professional appliance installation and repair services for your home.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <a href="tel:19494149956" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(949) 414-9956</span>
                </a>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>fixlyappliances@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Serving Your Local Area</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Appliance Installation</li>
                <li>Appliance Repair</li>
                <li>Emergency Service</li>
                <li>Maintenance Plans</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} FixlyAppliance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
