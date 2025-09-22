-- Fix AI Chat Database Schema Issues
-- 1. Add missing reference_id column to credit_transactions
-- 2. Fix RLS policies for ai_chat_sessions

-- Add reference_id column to credit_transactions if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.credit_transactions ADD COLUMN reference_id TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Ensure ai_chat_sessions table exists with proper structure
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    persona TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    credits_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop existing RLS policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.ai_chat_sessions;

-- Enable RLS on ai_chat_sessions
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for ai_chat_sessions
CREATE POLICY "Users can view their own chat sessions"
ON public.ai_chat_sessions FOR SELECT
USING (user_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert their own chat sessions"
ON public.ai_chat_sessions FOR INSERT
WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own chat sessions"
ON public.ai_chat_sessions FOR UPDATE
USING (user_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete their own chat sessions"
ON public.ai_chat_sessions FOR DELETE
USING (user_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid()));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_created_at ON public.ai_chat_sessions(created_at);

-- Fix credit_transactions RLS policies to include reference_id
DROP POLICY IF EXISTS "Users can view their own credit transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can insert their own credit transactions" ON public.credit_transactions;

CREATE POLICY "Users can view their own credit transactions"
ON public.credit_transactions FOR SELECT
USING (user_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert their own credit transactions"
ON public.credit_transactions FOR INSERT
WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid()));