"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (user) {
          setStatus('success')
          setMessage('Authentication successful! Redirecting to your dashboard...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'An error occurred during authentication')
      }
    }

    handleCallback()
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="space-y-6 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="ChainWise Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ChainWise
              </span>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl font-bold">
              {status === 'loading' && 'Processing Authentication...'}
              {status === 'success' && 'Welcome to ChainWise!'}
              {status === 'error' && 'Authentication Error'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {status === 'loading' && 'Please wait while we complete your sign-in'}
              {status === 'success' && 'You have been successfully authenticated'}
              {status === 'error' && 'There was a problem with your authentication'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="text-center">
              <a
                href="/auth/signin"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Return to Sign In
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}