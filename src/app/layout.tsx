import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tokencenter.cc"),
  title: {
    template: "%s | TokenCenter",
    default: "TokenCenter — AI Model Pricing",
  },
  description:
    "Compare token prices, context windows, and capabilities across all major AI models.",
  openGraph: {
    siteName: "TokenCenter",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">{children}</body>
    </html>
  );
}
