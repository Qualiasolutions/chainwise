"use client"

import { useState, useEffect, useRef } from 'react'
import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
import { supabase } from '@/lib/supabase/client'
import { User, UserInsert } from '@/lib/supabase/types'
import { authManager, debounce, handleAuthError } from '@/lib/auth-utils'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  error: string | null
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  // Enhanced race condition prevention with mutex-like behavior
  const profileCreationInProgress = useRef<Map<string, Promise<User | null>>>(new Map())
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null)

  const fetchUserProfile = async (authUser: SupabaseUser, retryCount = 0): Promise<User | null> => {
    console.log(`🔍 Fetching profile for user ${authUser.id} (attempt ${retryCount + 1})`)

    try {
      // Check if profile creation is already in progress for this user
      const existingPromise = profileCreationInProgress.current.get(authUser.id)
      if (existingPromise) {
        console.log('⏳ Profile creation already in progress for auth_id:', authUser.id)
        // Return the existing promise to prevent race conditions
        return await existingPromise
      }

      // Try to get existing profile using direct Supabase call
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', authUser.id)
        .single()

      // Create profile if it doesn't exist
      if (!profile && profileError?.code === 'PGRST116') {
        console.log('🔨 Profile not found, creating new profile for auth_id:', authUser.id)

        // Create a promise for profile creation to prevent race conditions
        const profileCreationPromise = (async (): Promise<User | null> => {
          const newProfileData = {
            auth_id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || null,
            bio: null,
            location: null,
            website: null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            tier: 'free',
            credits: 3,
            monthly_credits: 3
          }

          try {
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select()
              .single()

            if (createError) {
              throw createError
            }

            console.log('Successfully created user profile:', createdProfile.id)
            return createdProfile
          } catch (createError: any) {
            console.error('Error creating user profile:', createError)

            // If user creation fails due to constraint, try to fetch again
            // This handles race conditions where user might have been created elsewhere
            if (createError.code === '23505' || createError.message?.includes('duplicate') || createError.message?.includes('constraint')) {
              console.log('Duplicate user detected, trying to fetch existing profile...')

              // Wait a bit and try to fetch the existing profile
              await new Promise(resolve => setTimeout(resolve, 1000))
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('auth_id', authUser.id)
                .single()

              if (existingProfile) {
                console.log('Found existing profile after constraint error:', existingProfile.id)
                return existingProfile
              }
            }

            throw createError
          }
        })()

        // Store the promise to prevent concurrent calls
        profileCreationInProgress.current.set(authUser.id, profileCreationPromise)

        try {
          const result = await profileCreationPromise
          return result
        } finally {
          // Clean up the promise from the map
          profileCreationInProgress.current.delete(authUser.id)
        }
      } else if (profileError && profileError.code !== 'PGRST116') {
        // Handle other database errors
        console.error('Database error fetching profile:', profileError)
        throw profileError
      }

      // console.log('Found existing user profile:', profile.id) // Reduce console noise
      return profile
    } catch (error: any) {
      console.error(`❌ Error fetching user profile (attempt ${retryCount + 1}):`, error)

      // Clear any in-progress promises on error
      profileCreationInProgress.current.delete(authUser.id)

      // Retry logic for transient errors
      if (retryCount < 3 && (
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('connection') ||
        error.code === 'NETWORK_ERROR'
      )) {
        console.log(`🔄 Retrying profile fetch in ${(retryCount + 1) * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
        return await fetchUserProfile(authUser, retryCount + 1)
      }

      setAuthState(prev => ({
        ...prev,
        error: `Failed to load user profile: ${error.message}`,
        loading: false
      }))
      return null
    }
  }

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 2

    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          console.error('Error getting session:', error)

          // Handle refresh token errors specifically
          if (error.message?.includes('refresh') || error.message?.includes('Refresh Token')) {
            console.log('Refresh token error detected, clearing session...')

            // Clear invalid session data
            await supabase.auth.signOut({ scope: 'local' })

            // Retry once after clearing
            if (retryCount < maxRetries) {
              retryCount++
              console.log(`Retrying session initialization (attempt ${retryCount}/${maxRetries})...`)
              setTimeout(() => {
                if (isMounted) getInitialSession()
              }, 1000)
              return
            }
          }

          setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        if (session?.user) {
          const profile = await fetchUserProfile(session.user)
          if (isMounted) {
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null
            })
          }
        } else {
          if (isMounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null
            })
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (isMounted) {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: 'Failed to initialize authentication'
          })
        }
      }
    }

    getInitialSession()

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        try {
          // Handle specific auth events
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token successfully refreshed')
            retryCount = 0 // Reset retry count on successful refresh
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out')
            // Clear any stored tokens
            if (typeof window !== 'undefined') {
              localStorage.removeItem('chainwise-auth-token')
            }
          } else if (event === 'USER_UPDATED') {
            console.log('User data updated')
          }

          if (session?.user) {
            const profile = await fetchUserProfile(session.user)
            if (isMounted) {
              setAuthState({
                user: session.user,
                profile,
                loading: false,
                error: null
              })
            }
          } else {
            if (isMounted) {
              setAuthState({
                user: null,
                profile: null,
                loading: false,
                error: null
              })
            }
          }
        } catch (error: any) {
          console.error('Error in auth state change:', error)

          // Handle refresh token errors during state change
          if (error?.message?.includes('refresh') || error?.message?.includes('Refresh Token')) {
            console.log('Refresh token error during state change, clearing session...')
            await supabase.auth.signOut({ scope: 'local' })
          }

          if (isMounted) {
            setAuthState(prev => ({ ...prev, error: 'Authentication error', loading: false }))
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()

      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      // Clear profile creation promises
      profileCreationInProgress.current.clear()

      // Clear session check interval
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current)
        sessionCheckInterval.current = null
      }
    }
  }, [])

  const signIn = async (userEmail: string, userPassword: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: errorMessage }
    }
  }

  const signUp = async (userEmail: string, userPassword: string, fullName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // First check if email already exists
      try {
        const emailCheckResponse = await fetch(`/api/auth/check-email?email=${encodeURIComponent(userEmail)}`)

        if (emailCheckResponse.ok) {
          const emailCheckData = await emailCheckResponse.json()

          if (emailCheckData.exists) {
            setAuthState(prev => ({
              ...prev,
              error: 'An account with this email already exists. Please sign in instead.',
              loading: false
            }))
            return { error: 'An account with this email already exists. Please sign in instead.' }
          }
        } else {
          console.warn('Email check API failed with status:', emailCheckResponse.status)
          // For production robustness, we continue with signup even if check fails
          // Supabase Auth will still prevent actual duplicates at the auth level
        }
      } catch (emailCheckError) {
        console.warn('Email check network/parsing failed:', emailCheckError)
        // Continue with signup - if there's a real duplicate, Supabase Auth will catch it
        // This ensures the signup flow doesn't break due to temporary API issues
      }

      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error: error.message }
      }

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        setAuthState(prev => ({ ...prev, loading: false }))
        return {
          error: null,
          requiresConfirmation: true,
          message: 'Please check your email and click the confirmation link to complete your registration.'
        }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: errorMessage }
    }
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return
      }

      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error signing out:', error)
      setAuthState(prev => ({ ...prev, error: 'Failed to sign out', loading: false }))
    }
  }

  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = 'Failed to sign in with Google'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: errorMessage }
    }
  }

  // Debounced profile refresh to prevent rapid successive calls
  const debouncedProfileRefresh = useRef(
    debounce(async () => {
      if (authState.user) {
        try {
          // Use auth manager to ensure valid session
          const hasValidSession = await authManager.ensureValidSession()

          if (!hasValidSession) {
            console.log('Session invalid during profile refresh, signing out...')
            await signOut()
            return
          }

          const profile = await authManager.retryWithAuth(() =>
            fetchUserProfile(authState.user!)
          )

          setAuthState(prev => ({
            ...prev,
            profile,
            error: null
          }))
        } catch (error) {
          const authError = handleAuthError(error)
          console.error('Error refreshing profile:', authError)
          setAuthState(prev => ({ ...prev, error: authError.message }))
        }
      }
    }, 1000) // 1 second debounce
  )

  const refreshProfile = async () => {
    debouncedProfileRefresh.current()
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    refreshProfile
  }
}