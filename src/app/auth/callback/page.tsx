"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          setLoading(false)
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          setSuccess(true)
          setTimeout(() => {
            router.replace('/dashboard')
          }, 2000)
        } else {
          // Check for error parameters
          const errorParam = searchParams.get('error')
          const errorDescription = searchParams.get('error_description')

          if (errorParam) {
            setError(errorDescription || errorParam)
          } else {
            setError('Authentication failed. Please try again.')
          }
        }
      } catch (err: any) {
        console.error('Callback handling error:', err)
        setError('An unexpected error occurred during authentication.')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

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
            {loading && (
              <>
                <CardTitle className="text-2xl font-bold">Authenticating...</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Please wait while we complete your authentication
                </CardDescription>
              </>
            )}
            {success && (
              <>
                <CardTitle className="text-2xl font-bold text-green-600">Welcome to ChainWise!</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Authentication successful. Redirecting to your dashboard...
                </CardDescription>
              </>
            )}
            {error && (
              <>
                <CardTitle className="text-2xl font-bold text-red-600">Authentication Failed</CardTitle>
                <CardDescription className="text-muted-foreground">
                  There was a problem with your authentication
                </CardDescription>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You've been successfully authenticated! Redirecting to your dashboard in a moment.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">
                    Back to Sign In
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/signup">
                    Create New Account
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}