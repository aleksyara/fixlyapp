'use client';//needed for usePathname that is React hook reads path in the browser at real time

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, User, LogOut, Settings, Bell } from 'lucide-react';
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

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut, hasRole } = useAuth();
  const onBookFlow = pathname?.startsWith('/book'); // covers /book and subroutes

  const getRoleBadge = () => {
    if (hasRole(UserRole.ADMIN)) return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
    if (hasRole(UserRole.TECHNICIAN)) return <Badge className="bg-blue-100 text-blue-800">Technician</Badge>;
    if (hasRole(UserRole.CLIENT)) return <Badge className="bg-green-100 text-green-800">Client</Badge>;
    return null;
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
                    <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
                      <User className="h-4 w-4" />
                      {user?.name || user?.email?.split('@')[0]}
                      {getRoleBadge() && (
                        <div className="absolute -top-2 -right-2">
                          {getRoleBadge()}
                        </div>
                      )}
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
                    {hasRole(UserRole.ADMIN) && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button onClick={() => router.push("/auth/signin")} variant="outline" size="sm">
                Sign In
              </Button>
            )}

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
