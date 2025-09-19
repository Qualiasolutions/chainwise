"use client"

import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
import { supabase } from '@/lib/supabase/client'
import { User } from '@/lib/supabase/types'

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
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Create profile if it doesn't exist
      if (!profile) {
        const newProfile: User = {
          id: crypto.randomUUID(),
          auth_id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || null,
          tier: 'free',
          credits: 3,
          monthly_credits: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single()

        if (createError) throw createError

        return createdProfile
      }

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

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  }
}