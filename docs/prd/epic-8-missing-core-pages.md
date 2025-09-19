# Epic 8: Missing Core Pages Implementation

**Epic Goal**: Implement all missing core pages (Market Analysis, Trading, Portfolio, Profile, Settings) with complete functionality and consistent design system to achieve full platform feature parity.

## Background
This is a brownfield enhancement epic addressing the gap between the current excellent AI chat interface and a complete crypto advisory platform. The existing codebase has production-ready UI/UX with shadcn/ui components and glassmorphism design - we need to extend this quality to all platform pages.

## Acceptance Criteria for Epic
- [ ] Market Analysis page with live crypto data and advanced charts
- [ ] Trading interface with buy/sell simulation and order management
- [ ] Portfolio Management page with comprehensive CRUD operations
- [ ] User Profile management with account settings and preferences
- [ ] Settings page with theme switching and notification controls
- [ ] Consistent design system across all new pages
- [ ] Responsive mobile experience for all implementations

## User Stories

### Story 8.1: Market Analysis Page

As a crypto investor,
I want to access comprehensive market analysis tools,
so that I can make informed investment decisions based on real-time market data.

#### Acceptance Criteria
1. **Market Overview Dashboard**
   - Global crypto market cap with 24h change
   - Bitcoin and Ethereum dominance percentages
   - Fear and Greed Index integration
   - Top gainers and losers (top 10 each)

2. **Interactive Charts**
   - Advanced charting with multiple timeframes (1D, 7D, 30D, 90D, 1Y)
   - Candlestick, line, and area chart options
   - Volume overlay with price charts
   - Zoom and pan functionality for detailed analysis

3. **Market Discovery**
   - Trending cryptocurrencies based on volume and price movement
   - Market sector performance (DeFi, Gaming, Layer 1, etc.)
   - New listings and recently added cryptocurrencies
   - Search and filter functionality for crypto discovery

4. **Technical Integration**
   - CoinGecko API integration for real-time data
   - Recharts implementation matching existing dashboard style
   - Responsive design following established patterns
   - Loading states and error handling

### Story 8.2: Trading Interface

As a trader,
I want a professional trading interface to simulate trades and track trading performance,
so that I can practice strategies and monitor my trading activities.

#### Acceptance Criteria
1. **Trading Dashboard**
   - Real-time price display for major cryptocurrencies
   - Buy/sell order form with market and limit order types
   - Portfolio impact preview before order execution
   - Order confirmation dialog with trade summary

2. **Order Management**
   - Order history table with filtering and sorting
   - Trade execution with simulated fills at market prices
   - Position tracking with P&L calculations
   - Cancel pending orders functionality

3. **Trading Analytics**
   - Win/loss ratio and performance metrics
   - Trading volume and frequency statistics
   - Best and worst performing trades
   - Monthly and daily trading summaries

4. **Integration Features**
   - Link to user portfolios for position management
   - Integration with AI chat for trading advice
   - Real-time price feeds matching market analysis page
   - Risk warnings and educational tooltips

### Story 8.3: Portfolio Management Page

As a portfolio manager,
I want comprehensive portfolio management tools,
so that I can efficiently manage multiple portfolios and track their performance.

#### Acceptance Criteria
1. **Portfolio Overview**
   - Grid view of all user portfolios with key metrics
   - Create new portfolio button with tier-based limits
   - Portfolio performance comparison charts
   - Quick actions (edit, delete, clone portfolio)

2. **Portfolio Details View**
   - Holdings table with real-time values and P&L
   - Portfolio allocation pie chart and sector breakdown
   - Performance chart with multiple timeframe options
   - Add/edit/remove holdings functionality

3. **Advanced Features**
   - Portfolio rebalancing recommendations
   - Correlation analysis between holdings
   - Risk metrics (volatility, Sharpe ratio, max drawdown)
   - Export portfolio data and performance reports

4. **Holdings Management**
   - Advanced crypto search with market cap and volume data
   - Batch operations for multiple holdings
   - Transaction history for each holding
   - Average cost basis calculations

### Story 8.4: User Profile Management

As a user,
I want to manage my account profile and preferences,
so that I can customize my experience and maintain account security.

#### Acceptance Criteria
1. **Account Information**
   - Display and edit basic profile information (name, email)
   - Account creation date and membership duration
   - Subscription tier display with upgrade options
   - Account statistics (portfolios created, trades executed, AI interactions)

2. **Subscription Management**
   - Current subscription tier and billing information
   - Usage statistics (AI credits used, portfolios created)
   - Subscription history and billing records
   - Stripe customer portal integration for billing management

3. **Security Settings**
   - Change password functionality
   - Two-factor authentication setup (future enhancement hook)
   - Login history and active sessions
   - Account deletion with data export option

4. **Preferences**
   - Default currency selection
   - Time zone settings
   - Privacy preferences and data sharing options
   - Newsletter and marketing email subscriptions

### Story 8.5: Settings & Configuration

As a user,
I want granular control over my application settings,
so that I can customize the experience to my preferences and needs.

#### Acceptance Criteria
1. **Appearance Settings**
   - Dark/light theme toggle with smooth transitions
   - Color scheme preferences within purple theme family
   - Font size and density options
   - Language selection (English default, extensible)

2. **Notification Preferences**
   - Email notification settings for price alerts
   - In-app notification preferences
   - Trading notification settings
   - AI chat notification preferences

3. **Privacy & Security**
   - Data sharing preferences
   - Analytics and tracking opt-out options
   - Session timeout settings
   - API access token management

4. **Advanced Settings**
   - Default portfolio for new holdings
   - Price alert frequency settings
   - Chart default timeframes and styles
   - Export/import user data functionality

## Technical Implementation Notes

### Page Architecture Pattern
```typescript
// Consistent page structure following existing dashboard pattern
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Page Title</h2>
      </div>
      {/* Content following established card patterns */}
    </div>
  );
}
```

### Required API Endpoints
```typescript
// Market Analysis APIs
GET /api/market/overview - Global market statistics
GET /api/market/trending - Trending cryptocurrencies
GET /api/market/sectors - Sector performance data
GET /api/market/prices/{symbol}/history - Historical price data

// Trading APIs
POST /api/trading/order - Execute simulated trade
GET /api/trading/orders - Get user order history
DELETE /api/trading/orders/{id} - Cancel pending order
GET /api/trading/analytics - Trading performance metrics

// Profile APIs
GET /api/user/profile - Get user profile data
PUT /api/user/profile - Update profile information
GET /api/user/usage - Get usage statistics
POST /api/user/export - Export user data

// Settings APIs
GET /api/user/settings - Get user preferences
PUT /api/user/settings - Update preferences
POST /api/user/settings/theme - Update theme preference
```

### Design System Consistency
- Follow existing glassmorphism card patterns
- Use established purple gradient color scheme
- Maintain responsive breakpoints and mobile-first approach
- Implement consistent loading states and error handling
- Use shadcn/ui components with existing theme overrides

## Brownfield Integration Strategy

### Preserve Existing Excellence
- Maintain current dashboard layout and sidebar navigation
- Extend existing design system without breaking changes
- Follow established component patterns and naming conventions
- Preserve current authentication and subscription logic

### Add New Functionality
- Create new pages under /dashboard/{page} following existing routing
- Extend Supabase schema for trading and settings data
- Add new API routes following established error handling patterns
- Implement new features with same tier-based access controls

### Data Integration
- Extend existing portfolio data model for advanced features
- Add trading simulation tables for order history
- Create user preferences table for settings storage
- Implement proper database relationships and RLS policies

## Functional Requirements Mapping
This epic addresses the following PRD functional requirements:
- **FR21**: Complete Market Analysis page with live crypto data and charts
- **FR22**: Trading interface with buy/sell simulation and analytics
- **FR23**: Full Portfolio Management system with advanced features
- **FR24**: User Profile management with account settings
- **FR25**: Settings page with theme switching and preferences
- **FR32**: Responsive design optimization for mobile experience

## Next Steps After Epic Completion
1. User acceptance testing across all new pages
2. Performance optimization for data-heavy pages
3. Integration testing with existing AI chat and dashboard
4. Preparation for Epic 9: Backend Integration & Infrastructure

## Dependencies
- Epic 1: Foundation & Authentication (completed)
- Epic 2: Portfolio Management Core (for advanced portfolio features)
- CoinGecko API integration for market data
- Existing shadcn/ui component library and design system

## Definition of Done
- [ ] All user stories completed and tested
- [ ] Market Analysis page fully functional with live data
- [ ] Trading interface operational with order management
- [ ] Portfolio Management page with advanced features
- [ ] Profile and Settings pages with full functionality
- [ ] Responsive design verified on mobile devices
- [ ] Integration with existing authentication and subscription systems
- [ ] Performance testing completed for data-heavy pages
- [ ] Code reviewed and merged following established patterns