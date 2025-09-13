import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import ThemeProvider from '@/components/ThemeProvider'
import { Web3Provider } from '@/components/Web3Provider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { PageErrorBoundary } from '@/components/ui/error-boundary'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

function AnalyticsWrapper() {
  try {
    return <Analytics />
  } catch (error) {
    console.warn('Analytics initialization failed:', error)
    return null
  }
}

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
        {/* Preconnect to external APIs for better performance */}
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        <PageErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <Web3Provider>
                <div className="min-h-screen">
                  <Navigation />
                  <main 
                    className="pb-16 lg:pb-0"
                    style={{ 
                      paddingTop: 'var(--header-height, 80px)',
                      minHeight: 'calc(100vh - var(--header-height, 80px))'
                    }}
                  >
                    {children}
                  </main>
                </div>
              </Web3Provider>
            </ThemeProvider>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </PageErrorBoundary>
        <AnalyticsWrapper />
      </body>
    </html>
  )
}