import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { EnhancedNavigation } from "@/components/enhanced-navigation";
import PageWrapper from "@/components/page-wrapper";
import { GlobalSidebarLayout } from "@/components/global-sidebar-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainWise - AI-Powered Crypto Trading Platform",
  description: "Advanced crypto trading platform with AI-powered insights, real-time market data, and professional-grade tools for serious traders.",
  keywords: ["cryptocurrency", "crypto trading", "AI trading", "blockchain", "portfolio management", "market analysis"],
  authors: [{ name: "ChainWise Team" }],
  creator: "ChainWise",
  publisher: "ChainWise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://chainwise.tech"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ChainWise - AI-Powered Crypto Trading Platform",
    description: "Advanced crypto trading platform with AI-powered insights, real-time market data, and professional-grade tools for serious traders.",
    url: "https://chainwise.tech",
    siteName: "ChainWise",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ChainWise - AI-Powered Crypto Trading Platform",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainWise - AI-Powered Crypto Trading Platform",
    description: "Advanced crypto trading platform with AI-powered insights, real-time market data, and professional-grade tools for serious traders.",
    creator: "@chainwise",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <EnhancedNavigation />
          <main className="min-h-screen">
            <GlobalSidebarLayout>
              <PageWrapper>
                {children}
              </PageWrapper>
            </GlobalSidebarLayout>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
