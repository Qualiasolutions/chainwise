"use client"

import { useState, useEffect } from 'react'
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

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Try to get existing profile using MCP helper
      const profile = await mcpSupabase.getUserByAuthId(authUser.id)

      // Create profile if it doesn't exist
      if (!profile) {
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
          return createdProfile
        } catch (createError: any) {
          console.error('Error creating user profile:', createError)

          // If user creation fails due to constraint, try to fetch again
          // This handles race conditions where user might have been created elsewhere
          if (createError.message?.includes('duplicate') || createError.message?.includes('constraint')) {
            console.log('Duplicate user detected, trying to fetch existing profile...')
            const existingProfile = await mcpSupabase.getUserByAuthId(authUser.id)
            if (existingProfile) {
              console.log('Found existing profile after constraint error:', existingProfile.id)
              return existingProfile
            }
          }

          throw createError
        }
      }

      console.log('Found existing user profile:', profile.id)
      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setAuthState(prev => ({ ...prev, error: 'Failed to load user profile' }))
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        if (session?.user) {
          const profile = await fetchUserProfile(session.user)
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: 'Failed to initialize authentication'
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const profile = await fetchUserProfile(session.user)
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null
            })
          } else {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null
            })
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setAuthState(prev => ({ ...prev, error: 'Authentication error', loading: false }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
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

  const signUp = async (email: string, password: string, fullName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // First check if email already exists
      try {
        const emailCheckResponse = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)

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
          console.warn('Email check API failed, proceeding with signup')
        }
      } catch (emailCheckError) {
        console.warn('Email check failed:', emailCheckError)
        // Continue with signup if email check fails
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
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