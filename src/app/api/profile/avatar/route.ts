// Profile Avatar Upload API Route
// POST /api/profile/avatar - Upload user profile avatar
// DELETE /api/profile/avatar - Remove user profile avatar

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`

    // Delete old avatar if exists
    const { data: oldProfile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', profile.id)
      .single()

    if (oldProfile?.avatar_url) {
      // Extract file path from URL
      const oldPath = oldProfile.avatar_url.split('/').slice(-2).join('/')
      await supabase.storage.from('avatars').remove([oldPath])
    }

    // Upload new avatar to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded avatar
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile with avatar URL' },
        { status: 500 }
      )
    }

    // Log the activity
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'profile_update',
      activity_description: 'Avatar image updated'
    })

    return NextResponse.json({
      success: true,
      avatar_url: publicUrl,
      message: 'Avatar uploaded successfully'
    })

  } catch (error: any) {
    console.error('Avatar upload API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .eq('auth_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (!profile.avatar_url) {
      return NextResponse.json({ error: 'No avatar to remove' }, { status: 400 })
    }

    // Extract file path from URL
    const filePath = profile.avatar_url.split('/').slice(-2).join('/')

    // Delete avatar from storage
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([filePath])

    if (deleteError) {
      console.error('Avatar delete error:', deleteError)
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Log the activity
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'profile_update',
      activity_description: 'Avatar image removed'
    })

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    })

  } catch (error: any) {
    console.error('Avatar delete API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
