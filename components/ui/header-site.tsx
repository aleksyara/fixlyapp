'use client';//needed for usePathname that is React hook reads path in the browser at real time

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import Logo from '@/components/ui/logo';
import BrandName from '@/components/ui/brand-name';
import { Button } from '@/components/ui/button';

export default function SiteHeader() {
  const pathname = usePathname();
  const onBookFlow = pathname?.startsWith('/book'); // covers /book and subroutes

  return (
    <header className="bg-white shadow-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-3 py-4 md:grid md:grid-cols-3 md:items-center">
          {/* Left: Logo */}
          <div className="justify-self-start">
            <Logo />
          </div>

          {/* Center: Brand name */}
          <div className="justify-self-center text-center">
            <BrandName />
          </div>

          {/* Right: Phone + (conditionally) Button */}
          <div className="flex items-center justify-center gap-2 md:justify-end">
            <a
              href="tel:19494149956"
              className="inline-flex items-center gap-1 text-gray-700 text-sm sm:text-base"
            >
              <Phone className="h-4 w-4" />
              <span>(949) 414-9956</span>
            </a>
            {pathname !== '/book' && (
             <>
              <span className="text-gray-400">/</span>
                <Link href="/book">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Book Appointment
                  </Button>
                </Link>
              </>
            )}            
          </div>
        </div>
      </div>
    </header>
  );
}
