import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://constructvision.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ConstructVision AI — Construction Cost Estimation",
    template: "%s | ConstructVision AI",
  },
  description:
    "AI-powered construction cost estimation and BOQ generation for Indian civil engineers. Generate a complete Bill of Quantities in under 60 seconds using Gemini AI.",
  keywords: [
    "construction cost estimation", "BOQ generator", "bill of quantities",
    "AI construction", "civil engineering", "CPWD rates", "PWD rates",
    "quantity surveyor", "construction India", "Gemini AI",
  ],
  authors:  [{ name: "ConstructVision AI" }],
  creator:  "ConstructVision AI",
  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         APP_URL,
    siteName:    "ConstructVision AI",
    title:       "ConstructVision AI — AI-Powered Construction Cost Estimation",
    description: "Generate a complete BOQ with 40+ line items in under 60 seconds. Built for Indian civil engineers.",
    images: [{
      url:    "/og-image.svg",
      width:  1200,
      height: 630,
      alt:    "ConstructVision AI — Construction Cost Estimation Platform",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "ConstructVision AI",
    description: "AI-powered BOQ generation for Indian construction projects",
    images:      ["/og-image.svg"],
  },
  robots: {
    index:   true,
    follow:  true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%23FF7510'/><text y='.9em' font-size='70' x='50%' text-anchor='middle'>⛏</text></svg>" />
      </head>
      <body className={`${dmSans.variable} ${dmSerif.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </Providers>
      </body>
    </html>
  );
}
