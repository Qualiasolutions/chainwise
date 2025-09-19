# Epic 2: Portfolio Management Core

**Epic Goal**: Create comprehensive portfolio management functionality allowing users to create, manage, and track multiple crypto portfolios with real-time price updates and basic performance metrics.

## Acceptance Criteria for Epic
- [ ] Users can create and manage multiple portfolios with tier-based limits
- [ ] Crypto holdings management with real-time price integration
- [ ] Portfolio value calculation with CoinGecko API integration
- [ ] Basic performance analytics and portfolio overview

## User Stories

### Story 2.1: Portfolio CRUD Operations

As a user,
I want to create and manage multiple portfolios,
so that I can organize my crypto investments by strategy, risk level, or other criteria.

#### Acceptance Criteria
1. Portfolio creation form with name and description fields
2. Portfolio listing page showing all user portfolios with summary stats
3. Portfolio editing functionality to update name and description
4. Portfolio deletion with confirmation dialog and proper data cleanup
5. Tier-based portfolio limits enforced (Free: 1, Pro: 3, Elite: 10)
6. Default portfolio designation for new users
7. Portfolio selection interface for multi-portfolio users

### Story 2.2: Crypto Holdings Management

As a user,
I want to add and manage crypto holdings within my portfolios,
so that I can track my actual investment positions and performance.

#### Acceptance Criteria
1. Add holding form with crypto search, amount, purchase price, and date
2. Holdings list view showing all positions within a portfolio
3. Edit holding functionality to update amount and purchase information
4. Remove holding with confirmation and portfolio value recalculation
5. Crypto search functionality integrated with CoinGecko API
6. Input validation for amounts, prices, and dates
7. Support for major cryptocurrencies (Bitcoin, Ethereum, top 100 by market cap)

### Story 2.3: Real-time Price Integration

As a user,
I want to see current market values for my holdings,
so that I can track real-time portfolio performance and make informed decisions.

#### Acceptance Criteria
1. CoinGecko API integration for real-time cryptocurrency prices
2. Automatic price updates every 60 seconds for active portfolios
3. Portfolio value calculation based on current market prices
4. Price change indicators (percentage and absolute) for 24-hour periods
5. Error handling for API failures with fallback to cached prices
6. Rate limiting compliance with CoinGecko API restrictions
7. Loading indicators during price fetch operations

### Story 2.4: Basic Portfolio Analytics

As a user,
I want to see fundamental portfolio performance metrics,
so that I can understand how my investments are performing over time.

#### Acceptance Criteria
1. Total portfolio value calculation in USD
2. Total gain/loss calculation (absolute and percentage)
3. Portfolio allocation pie chart showing asset distribution
4. Individual holding performance with profit/loss per position
5. Daily portfolio value change tracking
6. Simple performance chart showing portfolio value over time
7. Export functionality for basic portfolio data

## Technical Implementation Notes

### Database Schema Requirements
```sql
-- Portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  total_value_usd DECIMAL(20,8) DEFAULT 0,
  total_cost_usd DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Portfolio holdings table
CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  crypto_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  amount DECIMAL(20,8) NOT NULL,
  average_purchase_price_usd DECIMAL(20,8),
  current_price_usd DECIMAL(20,8),
  current_value_usd DECIMAL(20,8),
  cost_basis_usd DECIMAL(20,8),
  profit_loss_usd DECIMAL(20,8),
  profit_loss_percentage DECIMAL(10,4),
  first_purchase_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints Required
```typescript
// Portfolio Management APIs
GET /api/portfolio - Get user portfolios
POST /api/portfolio - Create new portfolio
PUT /api/portfolio/{id} - Update portfolio
DELETE /api/portfolio/{id} - Delete portfolio

// Holdings Management APIs
GET /api/portfolio/{id}/holdings - Get portfolio holdings
POST /api/portfolio/{id}/holdings - Add holding
PUT /api/portfolio/{id}/holdings/{holdingId} - Update holding
DELETE /api/portfolio/{id}/holdings/{holdingId} - Remove holding

// Price Data APIs
GET /api/crypto/prices - Get current crypto prices
GET /api/crypto/search - Search cryptocurrencies
```

### CoinGecko Integration
```typescript
// lib/crypto-api.ts
export class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private apiKey = process.env.COINGECKO_API_KEY;

  async getCurrentPrices(coinIds: string[]): Promise<PriceData[]> {
    const url = `${this.baseUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;
    // Implementation with rate limiting and error handling
  }

  async searchCoins(query: string): Promise<CoinSearchResult[]> {
    const url = `${this.baseUrl}/search?query=${query}`;
    // Implementation with caching
  }
}
```

### Tier-Based Feature Gating
```typescript
// lib/tier-limits.ts
export const TIER_LIMITS = {
  free: { portfolios: 1, ai_credits: 3 },
  pro: { portfolios: 3, ai_credits: 50 },
  elite: { portfolios: 10, ai_credits: 200 }
};

export function checkPortfolioLimit(userTier: string, currentCount: number): boolean {
  return currentCount < TIER_LIMITS[userTier].portfolios;
}
```

## Functional Requirements Mapping
This epic addresses the following PRD functional requirements:
- **FR2**: Users can create and manage multiple crypto portfolios with tier-based limits
- **FR3**: Users can add crypto holdings to portfolios with amount, purchase price, and purchase date tracking
- **FR4**: System automatically fetches real-time crypto prices from CoinGecko API and updates portfolio values

## Next Steps After Epic Completion
1. Validate portfolio creation and management flows
2. Test real-time price integration and error handling
3. Verify tier-based limits are properly enforced
4. Prepare for Epic 3: Advanced Analytics Engine development

## Dependencies
- Epic 1: Foundation & Authentication Infrastructure (must be completed)
- CoinGecko API account and rate limiting setup
- Database schema from Epic 1 extended with portfolio tables
- shadcn/ui components for forms and data display

## Definition of Done
- [ ] All user stories completed and tested
- [ ] Portfolio CRUD operations functional
- [ ] Real-time price integration working
- [ ] Basic analytics displaying correctly
- [ ] Tier-based limits enforced
- [ ] API endpoints documented and tested
- [ ] Error handling implemented for external API failures
- [ ] Code reviewed and merged to main branch