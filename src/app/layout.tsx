import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastHost";
import { Navigation } from "@/components/Navigation";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://theinboxguard.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inbox Guard - Email Security & Deliverability Platform",
  description:
    "Enterprise-grade email authentication and deliverability management. Protect your domain from spoofing and ensure perfect inbox placement.",
  keywords: [
    "email security",
    "DMARC",
    "SPF",
    "DKIM",
    "email deliverability",
    "domain protection",
  ],
  authors: [{ name: "Inbox Guard" }],
  metadataBase: new URL(BASE_URL),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <ToastProvider>
            <main className="flex-1">{children}</main>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
