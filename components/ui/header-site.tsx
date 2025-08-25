'use client';//needed for usePathname that is React hook reads path in the browser at real time

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, User, LogOut, Settings, Bell, Calendar, Briefcase, Coffee } from 'lucide-react';
import Logo from '@/components/ui/logo';
import BrandName from '@/components/ui/brand-name';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut, hasRole } = useAuth();
  const onBookFlow = pathname?.startsWith('/book'); // covers /book and subroutes
  const [technicianStatus, setTechnicianStatus] = useState<string>('READY_TO_WORK');

  useEffect(() => {
    if (user?.technicianStatus) {
      setTechnicianStatus(user.technicianStatus);
    }
  }, [user]);

  const toggleTechnicianStatus = async () => {
    try {
      const response = await fetch('/api/technician/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: technicianStatus === 'READY_TO_WORK' ? 'DAY_OFF' : 'READY_TO_WORK'
        }),
      });

      if (response.ok) {
        const newStatus = technicianStatus === 'READY_TO_WORK' ? 'DAY_OFF' : 'READY_TO_WORK';
        setTechnicianStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating technician status:', error);
    }
  };

  const getDisplayName = () => {
    if (hasRole(UserRole.ADMIN)) return 'Admin';
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const getActionButton = () => {
    if (hasRole(UserRole.ADMIN)) {
      return (
        <Button 
          onClick={() => window.open('/admin/calendar', '_blank')} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendar
        </Button>
      );
    } else if (hasRole(UserRole.TECHNICIAN)) {
      return (
        <Button 
          onClick={toggleTechnicianStatus}
          className={technicianStatus === 'READY_TO_WORK' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-orange-600 hover:bg-orange-700 text-white'
          }
        >
          {technicianStatus === 'READY_TO_WORK' ? (
            <>
              <Briefcase className="h-4 w-4 mr-2" />
              Ready To Work
            </>
          ) : (
            <>
              <Coffee className="h-4 w-4 mr-2" />
              Day Off
            </>
          )}
        </Button>
      );
    } else {
      // CLIENT
      return (
        <Link href="/book">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Book Appointment
          </Button>
        </Link>
      );
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-3 py-4 md:grid md:grid-cols-3 md:items-center">
          {/* Left: Logo */}
          <div className="justify-self-start">
            <Link href="/">
              <Logo />
            </Link>
          </div>

          {/* Center: Brand name */}
          <div className="justify-self-center text-center">
            <BrandName />
          </div>

          {/* Right: Phone + Auth + (conditionally) Button */}
          <div className="flex items-center justify-center gap-2 md:justify-end">
            <a
              href="tel:19494149956"
              className="inline-flex items-center gap-1 text-gray-700 text-sm sm:text-base"
            >
              <Phone className="h-4 w-4" />
              <span>(949) 414-9956</span>
            </a>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {getDisplayName()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {getActionButton()}
              </div>
            ) : (
              <Button onClick={() => router.push("/auth/signin")} variant="outline" size="sm">
                Sign In
              </Button>
            )}            
          </div>
        </div>
      </div>
    </header>
  );
}
