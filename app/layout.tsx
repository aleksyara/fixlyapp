import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Logo from "@/components/ui/logo";
import BrandName from "@/components/ui/brand-name"; // ← import BrandName
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FixlyAppliance - Professional Appliance Installation & Repair",
  description:
    "Expert appliance installation and repair services. Book your appointment today for reliable, professional service.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-dvh bg-background text-foreground antialiased`}
      >
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center gap-3 py-4 md:grid md:grid-cols-3 md:items-center">
              {/* Left: Logo */}
              <div className="justify-self-start">
                <Logo />
              </div>

              {/* Center: Brand name (text only) */}
              <div className="justify-self-center text-center">
                {/* brand-name.tsx renders the responsive “Fix Appliance Easy” text */}
                <BrandName />
              </div>

              {/* Right: Phone + Button grouped tightly */}
              <div className="flex items-center justify-center gap-2 md:justify-end">
                <a
                  href="tel:19494149956"
                  className="inline-flex items-center gap-1 text-gray-700 text-sm sm:text-base"
                >
                  <Phone className="h-4 w-4" />
                  <span>(949) 414-9956</span>
                </a>
                <Link href="/book">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
