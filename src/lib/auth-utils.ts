import { supabase } from './supabase/client'

// Enhanced authentication utilities for better session management
export class AuthManager {
  private static instance: AuthManager
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private readonly SESSION_CHECK_INTERVAL = 60000 // Check every minute
  private readonly TOKEN_REFRESH_BUFFER = 300000 // 5 minutes before expiry

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSessionMonitoring()
    }
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  private async initializeSessionMonitoring() {
    // Start periodic session health checks
    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionHealth()
    }, this.SESSION_CHECK_INTERVAL)

    // Initial session check
    await this.checkSessionHealth()
  }

  private async checkSessionHealth(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.warn('Session health check failed:', error)
        // If there's an error getting the session, attempt to refresh
        await this.handleSessionRefresh()
        return
      }

      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()

        // If token expires in less than 5 minutes, proactively refresh
        if (timeUntilExpiry < this.TOKEN_REFRESH_BUFFER && timeUntilExpiry > 0) {
          console.log('Token expiring soon, proactively refreshing...')
          await this.handleSessionRefresh()
        }
      }
    } catch (error) {
      console.error('Session health check error:', error)
    }
  }

  private async handleSessionRefresh(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Session refresh failed:', error)
        // If refresh fails, the user will need to sign in again
        this.clearSession()
        return
      }

      if (data?.session) {
        console.log('Session refreshed successfully')
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      this.clearSession()
    }
  }

  private clearSession(): void {
    // Clear all auth-related storage
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('chainwise-auth-token')
        window.sessionStorage.removeItem('chainwise-auth-token')

        // Clear any other Supabase auth keys
        const keys = Object.keys(window.localStorage)
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            window.localStorage.removeItem(key)
            window.sessionStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('Error clearing session storage:', error)
      }
    }
  }

  public async ensureValidSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        return false
      }

      // Check if session is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        console.log('Session expired, attempting refresh...')
        await this.handleSessionRefresh()

        // Check again after refresh
        const { data: { session: newSession } } = await supabase.auth.getSession()
        return !!newSession
      }

      return true
    } catch (error) {
      console.error('Error ensuring valid session:', error)
      return false
    }
  }

  public async retryWithAuth<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Ensure we have a valid session before the operation
        const hasValidSession = await this.ensureValidSession()

        if (!hasValidSession && attempt === 1) {
          throw new Error('No valid session available')
        }

        return await operation()
      } catch (error: any) {
        // If it's an auth error and we have retries left, try to refresh the session
        if (
          attempt < maxRetries &&
          (error.message?.includes('JWT') ||
           error.message?.includes('auth') ||
           error.status === 401)
        ) {
          console.log(`Auth error on attempt ${attempt}, refreshing session...`)
          await this.handleSessionRefresh()
          continue
        }

        throw error
      }
    }

    throw new Error(`Operation failed after ${maxRetries} attempts`)
  }

  public destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
  }
}

// Export a singleton instance
export const authManager = AuthManager.getInstance()

// Enhanced error boundary for auth-related operations
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// Utility function to handle auth errors gracefully
export const handleAuthError = (error: any): AuthError => {
  if (error instanceof AuthError) {
    return error
  }

  const message = error?.message || 'Authentication error occurred'
  const code = error?.code || error?.status?.toString()

  return new AuthError(message, code, error)
}

// Debounce utility for preventing rapid successive calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}