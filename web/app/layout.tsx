import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { AskTidlProvider } from "@/components/ai/AskTidlProvider";
import { MenuBarrageHost } from "@/components/chrome/MenuBarrageHost";
import { PricingTermsProvider } from "@/components/legal/PricingTermsProvider";
import { EmailCaptureProvider } from "@/components/marketing/EmailCaptureProvider";
import { optImgSrc } from "@/lib/media/opt-manifest";
import "./globals.css";

const ogImage = "/og/preview.jpg";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tidlll.com"),
  title: "TIDL",
  description: "Physician guided therapy. Made in the USA.",
  openGraph: {
    images: [
      {
        url: optImgSrc(ogImage, 1600),
        width: 1024,
        height: 537,
        alt: "TIDL",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [optImgSrc(ogImage, 1600)],
  },
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
              <MenuBarrageHost />
            </PricingTermsProvider>
          </EmailCaptureProvider>
        </AskTidlProvider>
      </body>
    </html>
  );
}
