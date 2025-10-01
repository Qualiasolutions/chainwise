-- Create page_views analytics table for tracking user navigation
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    page_path TEXT NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own page views
CREATE POLICY "Users can view own page views"
    ON page_views
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own page views
CREATE POLICY "Users can insert own page views"
    ON page_views
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Service role can do anything (for admin/analytics)
CREATE POLICY "Service role has full access to page views"
    ON page_views
    FOR ALL
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
