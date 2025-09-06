# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChainWise is an AI-powered cryptocurrency investment management SaaS platform built with Next.js 14, featuring tiered subscriptions, portfolio analytics, and AI chat personas.

**Live Domain**: https://chainwise.tech  
**Test Credentials**: email: info@qualiasolutions.net, password: Zambelis1!

## Recent Updates & Current State

### 🎯 Completed (BMAD Method Implementation)

1. **BMAD Phase 1: UI/UX Unification & Design System**
   - ✅ Created unified design system with color tokens & typography
   - ✅ Removed 6+ duplicate components (pricing, dashboard, hero variations)
   - ✅ Implemented mobile-first responsive breakpoint strategy
   - ✅ Added WCAG 2.1 AA accessibility standards
   - ✅ Created comprehensive test page at `/test-components`

2. **BMAD Phase 2: Dashboard Unification**
   - ✅ Created unified dashboard at `src/components/dashboard/unified-dashboard.tsx`
   - ✅ Integrated Supabase MCP for real-time data fetching
   - ✅ Added Recharts for beautiful data visualizations
   - ✅ Implemented ChainWise gradient color system
   - ✅ Connected to user portfolios, AI sessions, and credits

3. **Dark Theme Implementation**
   - ✅ Set dark mode as default in `layout.tsx` with `className="dark"`
   - ✅ Updated CSS variables for black background (5% lightness)
   - ✅ Purple primary color (270° hue) for branding
   - ✅ Cards and popovers use slightly lighter black (8%)
   - ⚠️ **NOTE**: Dark theme configured but may need deployment to reflect on production

### 🚨 Known Issues

1. **Portfolio API Error (500)**
   - `/api/portfolio` endpoint returns 500 error on production
   - Error message: "Failed to fetch portfolios"
   - Needs backend investigation and fix

2. **Dark Theme Not Showing on Production**
   - Local changes made but not reflected on chainwise.tech yet
   - May need deployment/build process to update
   - CSS changes in `globals.css` and `layout.tsx` ready

### 📊 Current State of MCP Integrations

1. **Supabase MCP**: ✅ Connected and working
   - 22 tables available
   - 2 users in database
   - Dashboard successfully fetches data
   
2. **Shadcn-UI MCP**: ✅ Partially integrated
   - Chart component installed
   - 46 components available
   - 55 blocks ready to use (dashboard, sidebar, login)

3. **Playwright MCP**: ✅ Used for testing
   - Successfully tested authentication flow
   - Captured screenshots of live site
   - Identified portfolio page issues

## Next Steps for Development

### Phase 2 Continuation: Unified Component Library
1. Install remaining Shadcn-UI components
2. Replace all custom components with Shadcn versions
3. Ensure consistent styling across all components

### Phase 3: Build All Pages
1. Fix portfolio page API error
2. Enhance chat interface with AI personas
3. Build marketplace with premium features
4. Create learning/academy section

### Phase 4: Complete Backend Integration
1. Fix portfolio API endpoint
2. Connect all Supabase tables properly
3. Implement real-time subscriptions
4. Set up Stripe payment processing

### Phase 5: Testing & Optimization
1. Run comprehensive E2E tests
2. Fix accessibility issues
3. Optimize performance (target 95+ Lighthouse)
4. Deploy all changes to production

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Testing & Quality Assurance
```bash
# Run E2E tests with Playwright
npx playwright test

# Open Playwright test UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/[test-file].spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Generate test report
npx playwright show-report
```

### Component & UI Development
```bash
# Install Shadcn components
npx shadcn@latest add [component-name]

# List available shadcn components
npx shadcn@latest add

# Add multiple components at once
npx shadcn@latest add button card dialog
```

### Database & Supabase Management
```bash
# Use Supabase MCP tools for database operations:
# - mcp__supabase__list_tables
# - mcp__supabase__execute_sql  
# - mcp__supabase__apply_migration
# - mcp__supabase__get_logs
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL) - yppqtoovofcwoyzkhndu.supabase.co
- **Authentication**: Supabase Auth
- **Payments**: Stripe subscriptions
- **AI Integration**: OpenAI GPT-4
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS (with dark theme default)
- **Charts**: Recharts
- **Web3**: RainbowKit, Wagmi, Viem
- **Type Safety**: TypeScript with strict mode

### Directory Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (⚠️ portfolio endpoint needs fix)
│   ├── auth/           # Authentication pages (working)
│   ├── dashboard/      # Dashboard page (using unified-dashboard)
│   ├── portfolio/      # Portfolio management (API error)
│   ├── chat/           # AI chat interface
│   └── settings/       # User settings
├── components/         # React components
│   ├── dashboard/      # New unified dashboard component
│   ├── ui/            # shadcn/ui base components
│   └── [feature].tsx  # Feature-specific components
├── lib/               # Core services and utilities
│   ├── supabase/      # Supabase client configuration
│   ├── *-service.ts   # Business logic services
│   └── utils.ts       # Utility functions
├── styles/            # Global styles
│   └── design-tokens.css # ChainWise design system
└── types/             # TypeScript type definitions
```

### Key Services

- **supabase/client.ts & server.ts**: Database client configuration ✅
- **ai-service.ts**: OpenAI integration for chat personas
- **portfolio-service.ts**: Portfolio analytics and management (⚠️ needs fix)
- **credit-service.ts**: Credit system management
- **stripe.ts**: Payment processing
- **permissions.ts**: Tier-based access control
- **alert-service.ts**: Price alert system
- **notification-service.ts**: In-app notifications

### Database Schema (Supabase)

Working tables (22 total):
- `users` - User profiles and subscription status (2 users)
- `portfolios` - User portfolios (1 portfolio)
- `portfolio_holdings` - Individual holdings (2 holdings)
- `ai_chat_sessions` - Chat conversations
- `user_alerts` - Price alerts
- `credit_transactions` - Credit usage tracking (2 transactions)
- `notifications` - User notifications
- Plus 15 more tables for complete functionality

### Design System

**Color Scheme (Dark Theme Default)**:
```css
/* Dark mode with black and purple theme */
--background: 0 0% 5%; /* Near black background */
--foreground: 270 100% 95%; /* Light purple text */
--card: 0 0% 8%; /* Slightly lighter black for cards */
--primary: 270 100% 65%; /* Purple primary */
--secondary: 270 50% 25%; /* Darker purple secondary */
```

**ChainWise Brand Colors**:
- Primary: #4f46e5 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Accent: #2563eb (Blue)
- Success: #10b981 (Green)
- Warning: #f59e0b (Amber)
- Error: #ef4444 (Red)

### Component Patterns

- All components use TypeScript with proper type definitions
- UI components from shadcn/ui are in `src/components/ui/`
- Feature components follow `[Feature].tsx` naming convention
- Server components are default, client components use `"use client"`
- Form handling uses react-hook-form with zod validation
- Design tokens in `src/styles/design-tokens.css`

### Testing

- E2E tests use Playwright (tests directory)
- Test configuration in playwright.config.ts
- Run tests before major changes
- Live testing available at chainwise.tech

### Build Configuration

- **TypeScript**: Errors temporarily ignored in production builds (`next.config.js:4`)
- **Webpack**: Custom configuration for Web3 dependencies and fallbacks (`next.config.js:23-46`)
- **ESM Externals**: Enabled for better compatibility (`next.config.js:49`)
- **Image Domains**: Configured for CoinGecko and Unsplash (`next.config.js:7-22`) 
- **Dark Theme**: Default theme set in `layout.tsx:31` with `className="dark"`
- **Transpilation**: RainbowKit and Wagmi packages transpiled (`next.config.js:47`)

## Important Notes for Development

### Critical Issues to Address
1. **Portfolio API Error**: `/api/portfolio` endpoint returns 500 error on production (needs backend fix)
2. **Dark Theme Deployment**: Changes made locally but not reflected on chainwise.tech

### Development Guidelines
1. **Supabase Integration**: Use MCP tools (`mcp__supabase__*`) for all database operations
2. **Test Account**: Use `info@qualiasolutions.net` / `Zambelis1!` for testing authenticated features
3. **Permission System**: Always check user permissions via `src/lib/permissions.ts:116-175` before allowing actions
4. **Component Architecture**: Follow unified component pattern established in `src/components/dashboard/unified-dashboard.tsx`
5. **Design System**: Use ChainWise gradient colors and design tokens from `src/styles/design-tokens.css`

### MCP Servers Available
- **Supabase**: Database operations, migrations, logs
- **Playwright**: Browser automation and testing
- **Context7**: Documentation retrieval
- **Filesystem**: File operations
- **Memory**: Knowledge graph storage
- **Sequential-thinking**: Multi-step reasoning

### Code Quality Standards
- **TypeScript**: Strict mode enabled, use proper type definitions from `src/types/`
- **Error Handling**: Use `src/lib/api-error-handler.ts` for consistent API error handling
- **Authentication**: Supabase Auth configured in `src/lib/supabase/` (client/server)
- **Credit System**: Implement credit checks using `src/lib/credit-service.ts`
- **Performance**: Use caching service from `src/lib/cache-service.ts` for expensive operations

## Git Workflow

Recent commits:
- 🌙 Dark theme as default with black/purple color scheme
- 🎨 BMAD Phase 2: Unified Dashboard with Supabase Integration
- 🚀 BMAD Method Phase 1: UI/UX Unification & Design System Foundation

Always follow conventional commit format and include comprehensive descriptions.