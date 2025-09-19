# Supabase Setup Guide

This guide explains how to set up Supabase for the ChainWise project.

## Quick Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Schema**
   - Run the migration file `migrations/001_initial_schema.sql` in your Supabase SQL editor
   - This creates all necessary tables with RLS policies

4. **Authentication Setup**
   - Enable Email authentication in Supabase Auth settings
   - Optionally enable Google OAuth provider
   - Set site URL to `http://localhost:3000` for development

## Database Schema

The migration creates these tables:
- `users` - User profiles with tier and credits
- `portfolios` - User crypto portfolios
- `portfolio_holdings` - Individual crypto holdings
- `ai_chat_sessions` - AI conversation history
- `user_alerts` - Price alerts and notifications
- `subscription_history` - Stripe subscription tracking

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Auth policies prevent unauthorized access

## Development

Once set up, the application will:
- Show authentication screen for unauthenticated users
- Automatically create user profiles on signup
- Use real user data instead of mock data
- Maintain existing UI/UX while adding backend functionality