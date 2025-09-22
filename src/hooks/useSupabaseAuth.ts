"use client"

import { useState, useEffect, useRef } from 'react'
import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
import { supabase } from '@/lib/supabase/client'
import { User, UserInsert } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

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

  // Add ref to track ongoing profile creation to prevent race conditions
  const profileCreationInProgress = useRef<string | null>(null)

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Check if profile creation is already in progress for this user
      if (profileCreationInProgress.current === authUser.id) {
        console.log('Profile creation already in progress for auth_id:', authUser.id)
        // Wait for the in-progress creation to complete
        let retries = 0
        while (profileCreationInProgress.current === authUser.id && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 500))
          retries++
        }
      }

      // Try to get existing profile using MCP helper
      const profile = await mcpSupabase.getUserByAuthId(authUser.id)

      // Create profile if it doesn't exist
      if (!profile) {
        // Mark this auth_id as having profile creation in progress
        if (profileCreationInProgress.current === authUser.id) {
          console.log('Profile creation already marked as in progress, returning early')
          return null
        }

        profileCreationInProgress.current = authUser.id
        console.log('Creating new user profile for auth_id:', authUser.id)

        const newProfileData: UserInsert = {
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
          const createdProfile = await mcpSupabase.createUser(newProfileData)
          console.log('Successfully created user profile:', createdProfile.id)

          // Clear the in-progress flag
          profileCreationInProgress.current = null

          return createdProfile
        } catch (createError: any) {
          console.error('Error creating user profile:', createError)

          // Clear the in-progress flag
          profileCreationInProgress.current = null

          // If user creation fails due to constraint, try to fetch again
          // This handles race conditions where user might have been created elsewhere
          if (createError.message?.includes('duplicate') || createError.message?.includes('constraint')) {
            console.log('Duplicate user detected, trying to fetch existing profile...')

            // Wait a bit and try to fetch the existing profile
            await new Promise(resolve => setTimeout(resolve, 1000))
            const existingProfile = await mcpSupabase.getUserByAuthId(authUser.id)
            if (existingProfile) {
              console.log('Found existing profile after constraint error:', existingProfile.id)
              return existingProfile
            }
          }

          throw createError
        }
      }

      // console.log('Found existing user profile:', profile.id) // Reduce console noise
      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Clear the in-progress flag on error
      profileCreationInProgress.current = null
      setAuthState(prev => ({ ...prev, error: 'Failed to load user profile' }))
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          console.error('Error getting session:', error)
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        try {
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
          console.error('Error in auth state change:', error)
          if (isMounted) {
            setAuthState(prev => ({ ...prev, error: 'Authentication error', loading: false }))
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
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

  const refreshProfile = async () => {
    if (authState.user) {
      const profile = await fetchUserProfile(authState.user)
      setAuthState(prev => ({
        ...prev,
        profile,
        error: null
      }))
    }
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