import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { AskTidlProvider } from "@/components/ai/AskTidlProvider";
import { PricingTermsProvider } from "@/components/legal/PricingTermsProvider";
import { EmailCaptureProvider } from "@/components/marketing/EmailCaptureProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "TIDL",
  description: "Physician guided therapy. Made in the USA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <svg
          aria-hidden
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        >
          <filter
            id="tidl-pill-defringe"
            x="-4%"
            y="-4%"
            width="108%"
            height="108%"
            colorInterpolationFilters="sRGB"
          >
            <feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="slim" />
            <feComposite in="SourceGraphic" in2="slim" operator="in" />
          </filter>
        </svg>
        <AskTidlProvider>
          <EmailCaptureProvider>
            <PricingTermsProvider>
              <div className="layout-frame">{children}</div>
            </PricingTermsProvider>
          </EmailCaptureProvider>
        </AskTidlProvider>
      </body>
    </html>
  );
}
