// Profile Management API Routes
// PUT /api/profile - Update user profile

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database, UserUpdate } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

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

    // Prepare update data
    const updateData: UserUpdate = {
      full_name: full_name?.trim() || null,
      bio: bio?.trim() || null,
      location: location?.trim() || null,
      website: website?.trim() || null,
    }

    // Update user profile using MCP helper
    const updatedProfile = await mcpSupabase.updateUser(profile.id, updateData)

    return NextResponse.json({
      profile: updatedProfile,
      success: true
    })

  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}