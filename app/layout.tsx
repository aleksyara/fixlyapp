import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SiteHeader from "../components/ui/header-site";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-dvh bg-background text-foreground antialiased`}>
        <SiteHeader />  {/* ← header lives here */}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}