-- Enhance AI Chat Sessions for Modern Chat Interface
-- Adds title, preview, metadata fields for rich chat history
-- Date: October 1, 2025

-- Add new fields to ai_chat_sessions table
ALTER TABLE public.ai_chat_sessions
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'New Chat',
ADD COLUMN IF NOT EXISTS last_message_preview TEXT,
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create GIN index for message search (supports JSONB full-text search)
CREATE INDEX IF NOT EXISTS idx_chat_messages_search
ON public.ai_chat_sessions USING GIN (messages);

-- Create index for archived chats
CREATE INDEX IF NOT EXISTS idx_chat_archived
ON public.ai_chat_sessions(user_id, is_archived)
WHERE NOT is_archived;

-- Create index for favorite chats
CREATE INDEX IF NOT EXISTS idx_chat_favorite
ON public.ai_chat_sessions(user_id, is_favorite)
WHERE is_favorite;

-- Function to auto-generate chat metadata
CREATE OR REPLACE FUNCTION public.generate_chat_metadata()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  first_user_message TEXT;
  last_message TEXT;
  msg_count INTEGER;
BEGIN
  -- Calculate message count
  msg_count := jsonb_array_length(NEW.messages);
  NEW.message_count := COALESCE(msg_count, 0);

  -- Generate title from first user message if not set
  IF NEW.title IS NULL OR NEW.title = '' OR NEW.title = 'New Chat' THEN
    -- Find first user message
    SELECT
      substring((msg->>'content')::text FROM 1 FOR 50)
    INTO first_user_message
    FROM jsonb_array_elements(NEW.messages) AS msg
    WHERE msg->>'sender' = 'user'
    LIMIT 1;

    IF first_user_message IS NOT NULL AND first_user_message != '' THEN
      NEW.title := first_user_message ||
        CASE WHEN length(first_user_message) >= 50 THEN '...' ELSE '' END;
    ELSE
      NEW.title := 'New Chat with ' || COALESCE(NEW.persona, 'AI');
    END IF;
  END IF;

  -- Set last message preview
  IF msg_count > 0 THEN
    SELECT
      substring((msg->>'content')::text FROM 1 FOR 100)
    INTO last_message
    FROM jsonb_array_elements(NEW.messages) AS msg
    ORDER BY (msg->>'timestamp')::timestamp DESC
    LIMIT 1;

    NEW.last_message_preview := last_message ||
      CASE WHEN length(last_message) >= 100 THEN '...' ELSE '' END;
  END IF;

  -- Update timestamp
  NEW.updated_at := timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_chat_metadata ON public.ai_chat_sessions;

-- Create trigger for auto-updating metadata
CREATE TRIGGER update_chat_metadata
BEFORE INSERT OR UPDATE ON public.ai_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.generate_chat_metadata();

-- Function to search chat sessions
CREATE OR REPLACE FUNCTION public.search_chat_sessions(
  p_user_id UUID,
  p_search_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  persona TEXT,
  last_message_preview TEXT,
  message_count INTEGER,
  is_favorite BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.persona,
    s.last_message_preview,
    s.message_count,
    s.is_favorite,
    s.created_at,
    s.updated_at
  FROM public.ai_chat_sessions s
  WHERE s.user_id = p_user_id
    AND NOT s.is_archived
    AND (
      p_search_query IS NULL
      OR p_search_query = ''
      OR s.title ILIKE '%' || p_search_query || '%'
      OR s.last_message_preview ILIKE '%' || p_search_query || '%'
      OR s.messages::text ILIKE '%' || p_search_query || '%'
    )
  ORDER BY s.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get chat session with full messages
CREATE OR REPLACE FUNCTION public.get_chat_session_with_messages(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  persona TEXT,
  messages JSONB,
  credits_used INTEGER,
  message_count INTEGER,
  is_favorite BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.persona,
    s.messages,
    s.credits_used,
    s.message_count,
    s.is_favorite,
    s.created_at,
    s.updated_at
  FROM public.ai_chat_sessions s
  WHERE s.id = p_session_id
    AND s.user_id = p_user_id
    AND NOT s.is_archived
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to archive chat session
CREATE OR REPLACE FUNCTION public.archive_chat_session(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.ai_chat_sessions
  SET is_archived = true,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_session_id
    AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle favorite status
CREATE OR REPLACE FUNCTION public.toggle_chat_favorite(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_favorite BOOLEAN;
BEGIN
  SELECT is_favorite INTO current_favorite
  FROM public.ai_chat_sessions
  WHERE id = p_session_id
    AND user_id = p_user_id;

  IF current_favorite IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.ai_chat_sessions
  SET is_favorite = NOT current_favorite,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_session_id
    AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing sessions to populate new fields
UPDATE public.ai_chat_sessions
SET
  title = CASE
    WHEN jsonb_array_length(messages) > 0 THEN
      substring(
        (SELECT (msg->>'content')::text
         FROM jsonb_array_elements(messages) AS msg
         WHERE msg->>'sender' = 'user'
         LIMIT 1)
        FROM 1 FOR 50
      ) || '...'
    ELSE 'Chat with ' || persona
  END,
  message_count = jsonb_array_length(messages),
  last_message_preview = substring(
    (messages->-1->>'content')::text
    FROM 1 FOR 100
  ) || '...'
WHERE title IS NULL OR title = '';

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.search_chat_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_session_with_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_chat_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_chat_favorite TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.search_chat_sessions IS 'Search chat sessions by text query with pagination';
COMMENT ON FUNCTION public.get_chat_session_with_messages IS 'Get full chat session with all messages for a user';
COMMENT ON FUNCTION public.archive_chat_session IS 'Archive a chat session (soft delete)';
COMMENT ON FUNCTION public.toggle_chat_favorite IS 'Toggle favorite status of a chat session';
