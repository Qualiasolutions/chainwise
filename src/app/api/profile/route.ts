// Profile Management API Routes
// PUT /api/profile - Update user profile

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { full_name, bio, location, website } = body

    // Validate input
    if (full_name && typeof full_name !== 'string') {
      return NextResponse.json({ error: 'Invalid full_name' }, { status: 400 })
    }

    if (bio && typeof bio !== 'string') {
      return NextResponse.json({ error: 'Invalid bio' }, { status: 400 })
    }

    if (location && typeof location !== 'string') {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
    }

    if (website && typeof website !== 'string') {
      return NextResponse.json({ error: 'Invalid website' }, { status: 400 })
    }

    // Update user profile
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update({
        full_name: full_name?.trim() || null,
        bio: bio?.trim() || null,
        location: location?.trim() || null,
        website: website?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      profile: updatedProfile,
      success: true
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}