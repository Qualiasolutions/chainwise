# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

ChainWise is a production-ready AI-powered cryptocurrency advisory platform with full authentication system and enterprise-grade security. All major features are complete with real API integrations (CoinGecko + Supabase).

**Key Pages (run `npm run dev`):**
- `/market` - Live crypto market data
- `/portfolio` - Portfolio management with real database
- `/dashboard/analytics` - Portfolio analytics
- `/dashboard/ai` - AI chat with three personas

## Development Commands

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run start` - Start production server

## Tech Stack

- **Framework**: Next.js 15.5.3 with App Router + TypeScript 5 + React 19
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth with Google OAuth
- **APIs**: CoinGecko for crypto data, Supabase for user data
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion + next-themes
- **WebGL**: Three.js with custom GLSL shaders (CyberneticGridShader)
- **Charts**: Recharts for crypto visualizations
- **Tables**: TanStack React Table
- **Forms**: React Hook Form + Zod validation
- **Build**: Turbopack for development

## Project Architecture

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/components/ui/` - shadcn/ui components
- `src/lib/` - Utilities (crypto API, Supabase client)
- `src/app/api/` - API routes for portfolio, chat, alerts

### Authentication Flow
- Sign-in/sign-up pages in `src/app/auth/`
- Auth context via `src/hooks/useSupabaseAuth.ts`
- Protected routes with `src/components/auth/AuthRequired.tsx`

## Key Features

### AI Chat System
- Three personas: Buddy (free), Professor (pro), Trader (elite)
- Credit-based usage system with tier restrictions
- Mock responses ready for OpenAI integration
- Located in `src/app/dashboard/ai/page.tsx`

### Database Integration
- Supabase with Row Level Security enabled
- All 41 security warnings resolved (enterprise-ready)
- Real portfolio management with P&L calculations
- Authentication via Google OAuth

### UI Components
- shadcn/ui (New York variant) with CSS variables
- Purple-optimized dark/light theme via next-themes
- Framer Motion animations throughout
- Responsive design with sidebar navigation

## Configuration Notes

### Path Aliases
```typescript
"@/components/*" → "src/components/*"
"@/lib/*" → "src/lib/*"
"@/hooks/*" → "src/hooks/*"
```

### Next.js Config
- Turbopack enabled for dev and build
- TypeScript and ESLint errors ignored during builds (for faster development)
- Located in `next.config.ts`

## API Routes

### Portfolio Management
- `GET/POST /api/portfolio` - List/create portfolios
- `GET/PUT/DELETE /api/portfolio/[id]` - Manage specific portfolio
- `GET/POST /api/portfolio/[id]/holdings` - Manage holdings

### AI Chat & Notifications
- `POST /api/chat` - AI conversations with credit tracking
- `GET/POST /api/alerts` - Price alerts management
- `GET/PUT /api/notifications` - Notification system

## Development Notes

### Database Security
- Supabase with Row Level Security (RLS) fully enabled
- All 41 security warnings resolved (production-ready)
- Functions use `SET search_path = ''` for security

### AI Chat Implementation
- Mock responses in `src/app/dashboard/ai/page.tsx`
- Ready for OpenAI API integration
- Credit system with tier-based access controls

### Recent Updates (September 19, 2025)

#### CyberneticGridShader Integration
- **Replaced CelestialBloomShader**: Integrated new CyberneticGridShader with Three.js WebGL
- **Interactive Grid Animation**: Mouse interaction, energy pulses, and cybernetic grid effects
- **Orbital Timeline Background**: Enhanced RadialOrbitalTimeline with new shader system
- **Component Architecture**: TypeScript interface with proper cleanup and event handling

#### Dashboard Layout Enhancement
- **Full-Width Dashboard**: Fixed PageWrapper to allow dashboard pages to use full screen width
- **Sidebar Integration**: Dashboard content now spans from sidebar edge to screen edge
- **Layout Optimization**: Removed center constraints specifically for `/dashboard/*` routes
- **Responsive Design**: Improved content utilization on all screen sizes

### Known Issues
- TypeScript/ESLint errors ignored in build (see `next.config.ts`)
- AI responses are currently mocked (not real OpenAI)

## Important Notes

The platform is production-ready with complete authentication system and real API integrations. All mock data has been removed except for AI chat responses, which are ready for OpenAI integration.

## important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.