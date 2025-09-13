# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChainWise is an AI-powered cryptocurrency SaaS platform built with Next.js 14, featuring portfolio management, AI chat personas, subscription tiers, and advanced analytics. The application uses Supabase for database/auth, Stripe for payments, and integrates multiple crypto APIs.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing (Playwright)
```bash
npx playwright test                    # Run all E2E tests
npx playwright test --ui              # Run tests with UI mode
npx playwright test --headed          # Run tests in headed mode
npx playwright show-report           # Show test report
```

### Testing Individual Components
Tests are located in the `/tests/` directory. Key test files:
- `auth-redirect.spec.ts` - Authentication flow testing
- `chat.spec.ts` - AI chat functionality
- `chat-basic.spec.ts` - Basic chat features

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL with realtime features)
- **Authentication**: Supabase Auth with custom AuthProvider
- **Payments**: Stripe with subscription webhooks
- **AI Integration**: OpenAI GPT-4o-mini with Vercel AI SDK for streaming
- **Crypto Data**: CoinGecko API, Moralis for Web3
- **UI**: Tailwind CSS + shadcn/ui + Radix UI + Custom glassmorphism design system
- **Animations**: Framer Motion with performance optimizations
- **Web3**: RainbowKit + Wagmi + Viem for wallet connections
- **Testing**: Playwright for E2E testing (chromium, firefox, webkit, mobile)

### API Architecture

APIs are organized by feature domains under `/src/app/api/`:

#### Portfolio Management
- `/api/portfolio/` - Portfolio CRUD and analytics
- `/api/portfolio/[id]/holdings/` - Holdings management
- `/api/portfolio/[id]/analytics/` - Portfolio analytics
- `/api/portfolio/[id]/advanced-analytics/` - Risk metrics (VaR, Sharpe Ratio, Beta)
- `/api/portfolio/[id]/dashboard-stats/` - Dashboard statistics
- `/api/portfolio/[id]/pnl/` - P&L calculations
- `/api/portfolio/update-all/` - Batch portfolio updates

#### AI & Chat
- `/api/chat/` - AI chat with personas (Buddy, Professor, Trader)
- `/api/credits/balance/` - Credit balance management
- `/api/credits/spend/` - Credit consumption tracking
- `/api/credits/history/` - Credit transaction history

#### Market Data & Crypto
- `/api/market-data/` - Server-side proxy for CoinGecko API (handles CORS)
- `/api/crypto/list/` - Available cryptocurrencies
- `/api/crypto/top-movers/` - Market movers data

#### Alerts & Notifications
- `/api/alerts/` - Price alert CRUD operations
- `/api/alerts/check/` - Alert processing and triggers
- `/api/notifications/` - User notification system
- `/api/notifications/unread-count/` - Unread notification counter

#### Payments & Subscriptions
- `/api/stripe/create-checkout-session/` - Subscription creation
- `/api/stripe/create-portal-session/` - Billing portal access
- `/api/stripe/webhook/` - Stripe webhook handling

#### Premium Features
- `/api/premium-features/` - Premium feature access control
- `/api/reports/generate/` - Report generation
- `/api/whale-tracker/` - Whale tracking functionality
- `/api/narrative-scan/` - Market narrative analysis

### Component Architecture

#### Core Structure
```
src/components/
├── ui/                    # shadcn/ui base components + custom 3D/glass components
├── dashboard/             # Professional dashboard components (trader-style interface)
├── chat/                  # Professional chat interface components
├── portfolio/             # Portfolio management components
├── alerts/                # Price alerts components
├── auth/                  # Authentication components
├── navigation/            # Modern navbar and navigation
├── pricing/               # Subscription and pricing components
└── providers/             # Context providers (Auth, Supabase, etc.)
```

#### Key Components
- **Professional Dashboard** (`/dashboard/professional-dashboard.tsx`) - Enterprise-grade trader interface
- **Professional Chat Interface** (`/chat/professional-chat-interface.tsx`) - Streaming AI chat with glass-morphism
- **Hero Component** (`/ui/hero-1.tsx`) - Landing page hero with integrated chat launch
- **Command Palette** - Power user interface with ⌘K shortcut for quick actions

### Database Schema (Supabase)

Key entities and their relationships:
- `profiles` - User profile data and subscription information
- `portfolios` - User portfolio containers (tier-limited)
- `portfolio_holdings` - Individual cryptocurrency holdings
- `ai_chat_sessions` - AI conversation history and context
- `user_alerts` - Price alert configurations with tier-based quotas
- `credit_transactions` - AI credit usage tracking and billing
- `notifications` - System notifications and user alerts

### Authentication & Authorization

- **Middleware**: Route protection in `src/middleware.ts`
- **Protected Routes**: `/dashboard`, `/portfolio`, `/chat`, `/settings`, `/alerts`, `/notifications`
- **Auth Pages**: `/auth/signin`, `/auth/signup`, `/auth/callback`
- **Session Management**: Automatic refresh via Supabase middleware

### Subscription System

Three-tier system with comprehensive feature gating:
- **Free Tier**: 1 portfolio, 3 holdings, 3 AI credits/month, 3 alerts
- **Pro Tier**: 3 portfolios, 20 holdings each, 50 AI credits/month, 10 alerts
- **Elite Tier**: 10 portfolios, unlimited holdings, 200 AI credits/month, unlimited alerts

Feature gating is implemented throughout:
- API endpoint protection based on subscription tier
- Component-level access controls
- Credit consumption tracking for AI features

## Environment Configuration

### Required Environment Variables
```env
# Supabase (Required)
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

# Email (Nodemailer for notifications)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Refer to `.env.example` for complete configuration template.

## Development Workflow

### Adding New Features
1. Create API routes in appropriate feature directory under `/api/`
2. Implement authentication checks using Supabase helpers
3. Add subscription tier validation where applicable
4. Create corresponding UI components following existing patterns
5. Add E2E tests for critical user flows using Playwright

### Common Development Patterns

#### API Route Structure
```typescript
// Standard pattern with auth + subscription checks
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Implementation with tier validation
}
```

#### Component Patterns
- Use shadcn/ui as base components with custom glass-morphism enhancements
- Implement proper loading states with skeleton components
- Handle errors gracefully with user-friendly messages
- Follow existing naming conventions and file organization

### Database Operations
- Use Supabase client with proper TypeScript typing
- Implement Row Level Security (RLS) policies for data protection
- Use real-time subscriptions for live data updates
- Handle query errors appropriately with fallbacks

## Build Configuration

### Next.js Configuration
- **TypeScript**: Build errors ignored in production (`ignoreBuildErrors: true`)
- **Image Optimization**: Configured for CoinGecko, Unsplash domains
- **Webpack**: Custom configuration for WalletConnect, crypto libraries
- **Transpile**: RainbowKit, Wagmi packages transpiled for compatibility

### Middleware Configuration
- Route protection implemented for authenticated routes
- Session refresh handling for Supabase auth
- Callback URL preservation for auth flows
- Static asset bypass for performance

## Testing Strategy

### E2E Testing (Playwright)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing (Pixel 5, iPhone 12)
- Tests focus on critical user journeys:
  - Authentication flows and redirects
  - AI chat functionality and streaming
  - Portfolio management and analytics
  - Subscription upgrade/downgrade flows
  - Alert creation and management

### Test Environment
- Tests run against `http://localhost:3000`
- Use test database for E2E tests when possible
- Mock external API calls for consistent testing
- Verify subscription tier access controls

## Deployment

### Production Environment
- **Platform**: Vercel (chainwise-sand.vercel.app)
- **Database**: Production Supabase instance
- **Environment Variables**: Configure all required variables in Vercel dashboard
- **Build Process**: Automatic deployment on main branch push

### Database Management
- Schema changes managed through Supabase dashboard
- Real-time subscriptions configured for live features
- RLS policies implemented for data security
- Regular backups and monitoring in place

## Performance Considerations

### Optimization Strategies
- Real-time data caching with server-side proxy for CoinGecko API
- Virtualized message lists for chat interface performance
- Lazy loading for non-critical components
- Image optimization for crypto logos and charts
- Bundle size optimization with selective imports

### Monitoring
- Performance monitoring hooks implemented
- Error boundary components for graceful error handling
- Analytics integration with Vercel Analytics
- Real-time status indicators for WebSocket connections