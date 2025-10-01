-- Avatar Storage System
-- Created: 2025-10-01
-- Purpose: Add avatar storage infrastructure and profile image support

-- Add avatar_url column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] IN (
    SELECT u.id::text FROM users u WHERE u.auth_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] IN (
    SELECT u.id::text FROM users u WHERE u.auth_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] IN (
    SELECT u.id::text FROM users u WHERE u.auth_id = auth.uid()
  )
);

CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Function to get user's avatar URL
CREATE OR REPLACE FUNCTION get_user_avatar_url(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  avatar_path TEXT;
BEGIN
  SELECT avatar_url INTO avatar_path
  FROM public.profiles
  WHERE id = user_uuid;

  RETURN avatar_path;
END;
$$;

-- Function to update user's avatar URL
CREATE OR REPLACE FUNCTION update_user_avatar(
  user_uuid UUID,
  new_avatar_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update the profile with new avatar URL
  UPDATE public.profiles
  SET
    avatar_url = new_avatar_url,
    updated_at = NOW()
  WHERE id = user_uuid;

  -- Log the activity
  INSERT INTO public.user_activities (user_id, activity_type, activity_description)
  VALUES (user_uuid, 'profile_update', 'Avatar image updated');

  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'avatar_url', new_avatar_url,
    'updated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Add comment to column
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile avatar image stored in Supabase Storage';
