# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChainWise is an AI-powered cryptocurrency SaaS platform built with Next.js 14, featuring portfolio management, AI chat personas, subscription tiers, and advanced analytics. The application uses Supabase for database and auth, Stripe for payments, and integrates multiple crypto APIs.

**Key Features:**
- **Professional AI Chat Interface**: Enterprise-grade streaming chat with glass-morphism design
- **AI Personas**: ChainWise Assistant (Buddy), Market Analyst (Professor), Strategy Advisor (Trader)
- **Portfolio Management**: Multi-portfolio support with real-time analytics
- **Smart Alerts System**: Price alerts with tier-based limits
- **Subscription Tiers**: Free, Pro, Elite with feature gating and credit systems
- **Real-time Data**: CoinGecko API integration with server-side proxy

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npx playwright test                    # Run all E2E tests
npx playwright test --ui              # Run tests with UI mode
npx playwright test --headed          # Run tests in headed mode
npx playwright show-report           # Show test report
```

### Database Management (Supabase)
The project uses Supabase for database and authentication. Key database operations:
- Schema changes are managed through Supabase dashboard or SQL migrations
- Real-time subscriptions are configured for notifications and alerts
- Row-level security (RLS) policies control data access

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL with realtime features)
- **Authentication**: Supabase Auth with custom AuthProvider
- **Payments**: Stripe with subscription webhooks
- **AI Integration**: OpenAI GPT-4o-mini with Vercel AI SDK for streaming
- **Crypto Data**: CoinGecko API, Moralis for Web3
- **UI**: Tailwind CSS + shadcn/ui + Radix UI + Custom ChainWise 3D Design System with Glassmorphism
- **Animations**: Framer Motion with performance optimizations and reduced motion support
- **Testing**: Playwright for E2E testing (chromium, firefox, webkit, mobile)
- **Web3**: RainbowKit + Wagmi + Viem for wallet connections
- **Analytics**: Vercel Analytics

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes organized by feature
│   ├── dashboard/         # Main dashboard pages
│   ├── portfolio/         # Portfolio management
│   ├── chat/              # AI chat interface
│   ├── alerts/            # Price alerts management
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui base components + custom 3D components
│   ├── chat/              # Professional chat interface components
│   ├── portfolio/         # Portfolio management components
│   ├── alerts/            # Price alerts components
│   ├── charts/            # Chart components (Recharts)
│   └── modals/            # Modal dialogs
├── lib/                   # Utility functions and configurations
│   ├── supabase/          # Supabase client configurations
│   ├── stripe/            # Stripe payment utilities
│   └── utils.ts           # General utilities
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

### API Structure
The API is organized by feature domains:
- `/api/portfolio/` - Portfolio CRUD and analytics
- `/api/chat/` - AI chat functionality (redesigned with Vercel AI SDK streaming)
- `/api/alerts/` - Price alert management (recently fixed database schema)
- `/api/credits/` - Credit system management
- `/api/stripe/` - Payment processing
- `/api/notifications/` - Notification system
- `/api/market-data/` - Server-side proxy for CoinGecko API (handles CORS)

### Authentication & Authorization
- **Middleware**: `src/middleware.ts` handles route protection
- **Protected Routes**: `/dashboard`, `/portfolio`, `/chat`, `/settings`, `/alerts`, `/notifications`
- **Auth Pages**: `/auth/signin`, `/auth/signup`
- **Session Management**: Automatic refresh via Supabase middleware

### Subscription System
Three-tier system (Free, Pro, Elite) with:
- Feature gating throughout the application
- Credit-based AI usage tracking
- Stripe webhook handling for subscription events
- Automatic tier upgrades/downgrades

## Component Architecture

### UI Framework
- **Base**: shadcn/ui components in `src/components/ui/`
- **Custom**: Feature-specific components in organized subdirectories
- **Styling**: Tailwind CSS with custom design tokens
- **Theme**: Dark/light mode support via next-themes

### State Management
- **Server State**: Supabase real-time subscriptions
- **Client State**: React hooks and context for local state
- **Form State**: react-hook-form with Zod validation

## Database Schema Key Entities

### Core Tables
- `profiles` - User profile data and subscription info
- `portfolios` - User portfolio containers
- `portfolio_holdings` - Individual crypto holdings
- `ai_chat_sessions` - Chat conversation history
- `user_alerts` - Price alert configurations
- `credit_transactions` - AI credit usage tracking
- `notifications` - System notifications

### Relationships
- Users can have multiple portfolios (tier-limited)
- Portfolios contain multiple holdings
- AI sessions track conversation history per user
- Credit transactions are linked to specific features

## Recent Updates & Fixes (Latest)

### ✅ Professional Chat Interface Redesign (Complete)
- **Enterprise-grade Design**: Replaced childish 3D characters with professional glass-morphism interface
- **Streaming AI**: Implemented Vercel AI SDK for real-time streaming responses
- **Professional Personas**: ChainWise Assistant, Market Analyst, Strategy Advisor
- **Modern Patterns**: useChat hook, React streaming, credit integration

### ✅ Critical Production Issues Resolved
- **Portfolio Holdings**: Fixed Zod schema validation and date transformation
- **Alerts System**: Fixed database schema mismatch (`targetPrice` → `target_value`, etc.)
- **Chat Interface**: Fixed trim() undefined errors with null-safe operations
- **API Fixes**: Added missing await for createClient() calls
- **Accessibility**: Added DialogDescription to all modal components

### ✅ Database Schema Alignments
- **user_alerts table**: Proper column mapping for alerts API
  - `crypto_symbol` & `message` stored in `metadata` JSON field
  - `condition` mapped to `alert_type` (`price_above`/`price_below`) 
  - `targetPrice` mapped to `target_value`
- **Enhanced Validation**: Improved Zod schemas with proper transformations

### ✅ Current System Status
- **All API Endpoints**: Functional and tested
- **Chat Interface**: Enterprise-grade streaming working
- **Portfolio Management**: Holdings CRUD operations working
- **Alerts System**: Price alert creation and management working
- **Authentication**: Supabase auth properly configured
- **Environment**: All variables loading correctly (.env.local)

## Development Guidelines

### Adding New Features
1. Create API routes in appropriate feature directory under `/api/`
2. Implement proper authentication checks using Supabase helpers
3. Add subscription tier validation where applicable
4. Create corresponding UI components following existing patterns
5. Add E2E tests for critical user flows

### Database Changes
- Use Supabase dashboard for schema modifications
- Implement proper RLS policies for data security
- Test subscription tier access controls
- Update TypeScript types in `src/types/database.ts`

### AI Integration
- All AI features consume credits from user balance
- Implement proper error handling for OpenAI API calls
- Use streaming responses for better UX
- Track credit consumption for billing

### Deployment
- **Production**: Vercel (chainwise-sand.vercel.app)
- **Environment**: Configure all required environment variables in Vercel dashboard
- **Build**: TypeScript errors are ignored in production (next.config.js)
- **Database**: Production Supabase instance with proper RLS policies

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (Required for AI Chat)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Stripe (Required for Payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CoinGecko API (Required for Crypto Data)
NEXT_PUBLIC_COINGECKO_API_KEY=CG-...

# Email (Nodemailer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

## Common Development Patterns

### API Route Structure
```typescript
// Standard API route with auth + subscription checks
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Implementation
}
```

### Component Patterns
- Use shadcn/ui as base components
- Implement proper loading states
- Handle errors gracefully with user-friendly messages
- Follow existing naming conventions

### Database Queries
- Use Supabase client with proper type safety
- Implement RLS policies for security
- Use real-time subscriptions for live data
- Handle query errors appropriately

## Testing Strategy

### E2E Testing (Playwright)
- Tests are located in `/tests/` directory
- Configured for multiple browsers (Chrome, Firefox, Safari)
- Tests run against `http://localhost:3000`
- Focus on critical user journeys and subscription flows

### Test Environment
- Use test database for E2E tests
- Mock external API calls when necessary
- Test subscription upgrade/downgrade flows
- Verify proper access controls

## Common Issues & Solutions

### API Issues

1. **Supabase Client Errors**: "Your project's URL and Key are required"
   - **Fix**: Ensure `.env.local` exists with correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Note**: Always use `await createClient()` in API routes

2. **400 Errors on Holdings Creation**
   - **Fix**: Already resolved with proper Zod schema validation
   - **Issue**: Date format transformation in `addHoldingSchema`

3. **500 Errors on Alerts Creation**
   - **Fix**: Already resolved with database schema alignment
   - **Issue**: Column name mismatch (`targetPrice` vs `target_value`)

### Chat Interface Issues

4. **trim() Undefined Errors**
   - **Fix**: Already resolved with null-safe operations (`value?.trim()`)
   - **Issue**: Input validation without null checks

5. **Chat Not Loading**
   - **Check**: OpenAI API key in environment variables
   - **Check**: Import path should be `@ai-sdk/react` not `ai/react`

### Development Setup

6. **Port 3000 in Use**
   - **Solution**: Next.js automatically uses port 3001
   - **Manual**: Use `npm run dev -- -p 3002` for custom port

7. **Missing DialogDescription Warnings**
   - **Fix**: Already resolved by adding `DialogDescription` to all modals
   - **Pattern**: Always include both `DialogTitle` and `DialogDescription`

### Database Schema

8. **Column Not Found Errors**
   - **Check**: Verify database schema matches TypeScript types
   - **Pattern**: Use exact column names from `src/types/database.ts`
   - **Recently Fixed**: alerts table column mappings

### Production Deployment

9. **Environment Variables Not Loading**
   - **Vercel**: Set all variables in Vercel dashboard
   - **Local**: Ensure `.env.local` file exists and is properly formatted

10. **Build Failures**
    - **TypeScript**: Errors ignored in production (`ignoreBuildErrors: true`)
    - **Dependencies**: Check for version conflicts in package.json