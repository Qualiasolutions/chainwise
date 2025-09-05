import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import ThemeProvider from '@/components/ThemeProvider'
import { Web3Provider } from '@/components/Web3Provider'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChainWise - AI-Powered Crypto Investment Advisor',
  description: 'Get intelligent insights and advice for your cryptocurrency investments with our AI-powered platform.',
  keywords: 'cryptocurrency, bitcoin, ethereum, investment, AI, blockchain, trading',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Spline CDN for better 3D loading performance */}
        <link rel="preconnect" href="https://prod.spline.design" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        {/* Preconnect to external APIs */}
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <Web3Provider>
              <div className="min-h-screen">
                <Navigation />
                <main>
                  {children}
                </main>
              </div>
            </Web3Provider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}