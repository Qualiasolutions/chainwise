# API Specification

## Overview

ChainWise uses RESTful API endpoints built with Next.js API routes. All endpoints are serverless functions deployed on Vercel with Supabase backend integration.

## Base Configuration

**Base URL:** `https://chainwise.vercel.app/api` (production)
**Local Development:** `http://localhost:3000/api`

**Authentication:** Bearer JWT tokens from Supabase Auth
**Content-Type:** `application/json`
**Error Format:** Standardized error response format

## Authentication

### Authentication Header
All protected endpoints require authentication header:
```
Authorization: Bearer <supabase_jwt_token>
```

### Session Management
Sessions are managed by Supabase Auth with automatic token refresh.

## Error Handling

### Standard Error Response Format
```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INSUFFICIENT_CREDITS` (402): Not enough AI credits
- `TIER_LIMIT_REACHED` (403): Subscription tier limit exceeded

## Core API Endpoints

### Authentication Endpoints

#### Get Current User
```
GET /api/auth/user
```

**Purpose:** Retrieve current authenticated user profile

**Response:**
```typescript
{
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro' | 'elite';
  credits_balance: number;
  created_at: string;
  updated_at: string;
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
     https://chainwise.vercel.app/api/auth/user
```

### Portfolio Management Endpoints

#### Get User Portfolios
```
GET /api/portfolio
```

**Purpose:** Retrieve all portfolios for authenticated user

**Query Parameters:**
- `include_holdings` (boolean): Include holdings data
- `active_only` (boolean): Only return non-deleted portfolios

**Response:**
```typescript
{
  portfolios: Array<{
    id: string;
    name: string;
    description?: string;
    total_value_usd: number;
    total_cost_usd: number;
    profit_loss_usd: number;
    profit_loss_percentage: number;
    is_default: boolean;
    holdings?: PortfolioHolding[];
    created_at: string;
    updated_at: string;
  }>
}
```

#### Create Portfolio
```
POST /api/portfolio
```

**Purpose:** Create new portfolio for user

**Request Body:**
```typescript
{
  name: string;
  description?: string;
  is_default?: boolean;
}
```

**Validation:**
- Name: Required, 1-100 characters
- Description: Optional, max 500 characters
- Tier limits enforced (Free: 1, Pro: 3, Elite: 10)

**Response:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  total_value_usd: 0;
  total_cost_usd: 0;
  created_at: string;
  updated_at: string;
}
```

#### Update Portfolio
```
PUT /api/portfolio/[id]
```

**Purpose:** Update existing portfolio

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  is_default?: boolean;
}
```

#### Delete Portfolio
```
DELETE /api/portfolio/[id]
```

**Purpose:** Soft delete portfolio (sets deleted_at timestamp)

**Response:** `204 No Content`

### Portfolio Holdings Endpoints

#### Get Portfolio Holdings
```
GET /api/portfolio/[id]/holdings
```

**Purpose:** Retrieve all holdings for specific portfolio

**Response:**
```typescript
{
  holdings: Array<{
    id: string;
    crypto_id: string;
    symbol: string;
    name: string;
    amount: number;
    average_purchase_price_usd: number;
    current_price_usd: number;
    current_value_usd: number;
    cost_basis_usd: number;
    profit_loss_usd: number;
    profit_loss_percentage: number;
    first_purchase_date: string;
    created_at: string;
    updated_at: string;
  }>
}
```

#### Add Holding to Portfolio
```
POST /api/portfolio/[id]/holdings
```

**Purpose:** Add cryptocurrency holding to portfolio

**Request Body:**
```typescript
{
  crypto_id: string;
  symbol: string;
  name: string;
  amount: number;
  purchase_price_usd: number;
  purchase_date?: string;
}
```

**Validation:**
- Amount: Must be positive number
- Purchase price: Must be positive number
- Crypto ID: Must be valid CoinGecko ID

#### Update Holding
```
PUT /api/portfolio/[portfolioId]/holdings/[holdingId]
```

**Purpose:** Update existing holding amount or purchase information

#### Remove Holding
```
DELETE /api/portfolio/[portfolioId]/holdings/[holdingId]
```

**Purpose:** Remove holding from portfolio

### Portfolio Analytics Endpoints

#### Get Portfolio Analytics
```
GET /api/portfolio/[id]/analytics
```

**Purpose:** Calculate and return advanced portfolio analytics

**Query Parameters:**
- `period` (string): Time period for calculations (30d, 90d, 1y)
- `include_correlation` (boolean): Include correlation matrix

**Response:**
```typescript
{
  analytics: {
    total_value_usd: number;
    total_cost_usd: number;
    total_return_usd: number;
    total_return_percentage: number;

    // Risk Metrics
    value_at_risk_95: number;
    sharpe_ratio: number;
    beta: number;
    max_drawdown: number;
    volatility: number;

    // Performance Attribution
    best_performer: {
      symbol: string;
      return_percentage: number;
    };
    worst_performer: {
      symbol: string;
      return_percentage: number;
    };

    // Diversification
    correlation_matrix?: Record<string, Record<string, number>>;
    diversification_score: number;

    // Allocation
    allocation_by_asset: Array<{
      symbol: string;
      percentage: number;
      value_usd: number;
    }>;

    calculated_at: string;
  }
}
```

### AI Chat Endpoints

#### Get Chat Sessions
```
GET /api/chat
```

**Purpose:** Retrieve user's AI chat sessions

**Response:**
```typescript
{
  sessions: Array<{
    id: string;
    persona: 'buddy' | 'professor' | 'trader';
    title: string;
    is_active: boolean;
    message_count: number;
    last_message_at: string;
    created_at: string;
  }>
}
```

#### Send Message to AI
```
POST /api/chat
```

**Purpose:** Send message to AI and receive response

**Request Body:**
```typescript
{
  session_id?: string;  // Create new session if not provided
  persona: 'buddy' | 'professor' | 'trader';
  message: string;
  include_portfolio_context?: boolean;
}
```

**Validation:**
- Message: Required, 1-2000 characters
- Persona: Must be valid persona type
- User must have sufficient credits
- Persona must be accessible for user's tier

**Response:**
```typescript
{
  session_id: string;
  message_id: string;
  response: string;
  credits_used: number;
  credits_remaining: number;
  created_at: string;
}
```

#### Get Chat History
```
GET /api/chat/[sessionId]/messages
```

**Purpose:** Retrieve message history for chat session

**Query Parameters:**
- `limit` (number): Number of messages to return (default: 50)
- `offset` (number): Pagination offset

### Market Data Endpoints

#### Get Current Crypto Prices
```
GET /api/crypto/prices
```

**Purpose:** Retrieve current cryptocurrency prices

**Query Parameters:**
- `symbols` (string): Comma-separated crypto symbols (BTC,ETH,ADA)
- `vs_currency` (string): Target currency (default: usd)

**Response:**
```typescript
{
  prices: Record<string, {
    symbol: string;
    current_price: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h: number;
    last_updated: string;
  }>
}
```

#### Search Cryptocurrencies
```
GET /api/crypto/search
```

**Purpose:** Search for cryptocurrencies by name or symbol

**Query Parameters:**
- `q` (string): Search query
- `limit` (number): Maximum results (default: 10)

**Response:**
```typescript
{
  results: Array<{
    id: string;
    symbol: string;
    name: string;
    market_cap_rank: number;
    thumb: string;
  }>
}
```

#### Get Market Overview
```
GET /api/market/overview
```

**Purpose:** Get global cryptocurrency market statistics

**Response:**
```typescript
{
  global: {
    total_market_cap_usd: number;
    total_volume_usd: number;
    market_cap_change_percentage_24h: number;
    bitcoin_dominance_percentage: number;
    ethereum_dominance_percentage: number;
    active_cryptocurrencies: number;
    markets: number;
    updated_at: string;
  }
}
```

### Alert Management Endpoints

#### Get User Alerts
```
GET /api/alerts
```

**Purpose:** Retrieve user's price alerts

**Query Parameters:**
- `active_only` (boolean): Only return active alerts
- `crypto_id` (string): Filter by specific cryptocurrency

**Response:**
```typescript
{
  alerts: Array<{
    id: string;
    crypto_id: string;
    symbol: string;
    alert_type: 'price_above' | 'price_below' | 'percent_change';
    target_price?: number;
    percentage_threshold?: number;
    notification_method: 'email' | 'in_app' | 'both';
    is_active: boolean;
    is_triggered: boolean;
    triggered_at?: string;
    created_at: string;
  }>
}
```

#### Create Price Alert
```
POST /api/alerts
```

**Purpose:** Create new price alert

**Request Body:**
```typescript
{
  crypto_id: string;
  symbol: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change';
  target_price?: number;
  percentage_threshold?: number;
  notification_method: 'email' | 'in_app' | 'both';
}
```

**Validation:**
- Tier limits enforced (Free: 3, Pro: 10, Elite: unlimited)
- Target price or percentage threshold required based on alert type

#### Update Alert
```
PUT /api/alerts/[id]
```

#### Delete Alert
```
DELETE /api/alerts/[id]
```

### Subscription and Payment Endpoints

#### Create Checkout Session
```
POST /api/stripe/checkout
```

**Purpose:** Create Stripe checkout session for subscription

**Request Body:**
```typescript
{
  tier: 'pro' | 'elite';
  success_url?: string;
  cancel_url?: string;
}
```

**Response:**
```typescript
{
  checkout_url: string;
  session_id: string;
}
```

#### Create Billing Portal Session
```
POST /api/stripe/portal
```

**Purpose:** Create Stripe customer portal session

**Response:**
```typescript
{
  portal_url: string;
}
```

#### Stripe Webhook Handler
```
POST /api/stripe/webhook
```

**Purpose:** Handle Stripe webhook events

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Rate Limiting

### Rate Limit Headers
All responses include rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

### Rate Limits by Endpoint Type
- **General API**: 100 requests per minute per user
- **AI Chat**: 20 requests per minute per user
- **Market Data**: 60 requests per minute per user
- **Webhook**: No rate limiting

## API Usage Examples

### Complete Portfolio Creation Flow
```typescript
// 1. Create portfolio
const portfolio = await fetch('/api/portfolio', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Crypto Portfolio',
    description: 'Long-term investment portfolio'
  })
});

// 2. Add Bitcoin holding
const holding = await fetch(`/api/portfolio/${portfolio.id}/holdings`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    crypto_id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: 0.5,
    purchase_price_usd: 45000
  })
});

// 3. Get analytics
const analytics = await fetch(`/api/portfolio/${portfolio.id}/analytics`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### AI Chat Interaction
```typescript
// Send message to AI
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    persona: 'professor',
    message: 'What do you think about my Bitcoin allocation?',
    include_portfolio_context: true
  })
});

const { session_id, response: aiResponse, credits_used } = await response.json();
```

This API specification provides comprehensive documentation for all ChainWise endpoints with proper authentication, validation, and error handling patterns.