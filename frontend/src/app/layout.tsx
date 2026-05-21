import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { OfflineBanner } from "@/components/layout/offline-banner";

export const metadata: Metadata = {
  title: "RoadSOS AI — Emergency Intelligence System",
  description:
    "AI-powered multilingual road accident emergency platform with offline emergency assistance, GPS routing, accident severity prediction, and intelligent emergency coordination.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <OfflineBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
