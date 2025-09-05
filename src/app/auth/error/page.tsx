'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const errorMessages = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please try again later.',
    action: 'Try Again',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in. Please contact support if you believe this is an error.',
    action: 'Contact Support',
  },
  Verification: {
    title: 'Email Verification Required',
    description: 'Please check your email and click the verification link before signing in.',
    action: 'Resend Email',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication. Please try signing in again.',
    action: 'Try Again',
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The email or password you entered is incorrect. Please check your credentials and try again.',
    action: 'Try Again',
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'Unable to send email. Please try again or use a different sign in method.',
    action: 'Try Again',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',  
    description: 'Error occurred during OAuth sign in. Please try again or use email/password.',
    action: 'Try Again',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error occurred during OAuth callback. Please try signing in again.',
    action: 'Try Again',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create OAuth account. The email may already be registered with a different method.',
    action: 'Try Different Method',
  },
  EmailCreateAccount: {
    title: 'Email Account Error',
    description: 'Could not create account with this email. It may already be registered.',
    action: 'Try Sign In',
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error occurred during authentication callback. Please try again.',
    action: 'Try Again',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another account. Please sign in with your original method.',
    action: 'Try Different Method',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You need to be signed in to access this page.',
    action: 'Sign In',
  },
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages
  
  const errorInfo = errorMessages[error] || errorMessages.Default

  const handleAction = () => {
    switch (error) {
      case 'AccessDenied':
        window.location.href = 'mailto:support@chainwise.com'
        break
      case 'Verification':
        // In a real app, you'd implement email resend functionality
        window.location.href = '/auth/signin'
        break
      case 'OAuthAccountNotLinked':
      case 'EmailCreateAccount':
        window.location.href = '/auth/signin'
        break
      case 'OAuthCreateAccount':
        window.location.href = '/auth/signup'
        break
      default:
        window.location.href = '/auth/signin'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg border-red-200 dark:border-red-800">
          <CardHeader className="text-center pb-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button
              onClick={handleAction}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {errorInfo.action}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href="/auth/signup">
                  Sign Up
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Need Help?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              If you continue to experience issues, please contact our support team.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              <a href="mailto:support@chainwise.com">
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          {error && (
            <p className="mb-2 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
              Error Code: {error}
            </p>
          )}
          <p>
            Visit our{' '}
            <Link href="/help" className="underline hover:text-gray-700">
              Help Center
            </Link>{' '}
            for more assistance
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}