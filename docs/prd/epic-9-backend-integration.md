# Epic 9: Backend Integration & Infrastructure

**Epic Goal**: Implement complete Supabase backend with authentication, real-time data capabilities, OpenAI integration, and Stripe payment system to transform the current frontend-only application into a fully functional SaaS platform.

## Background
This epic represents the critical transition from a beautiful frontend demo to a production-ready SaaS application. The current implementation has excellent UI/UX with mock data - this epic will add real backend services, user authentication, data persistence, AI functionality, and payment processing.

## Acceptance Criteria for Epic
- [ ] Complete Supabase backend with PostgreSQL database and authentication
- [ ] Real OpenAI API integration replacing mock AI responses
- [ ] Stripe payment system with subscription management
- [ ] Real-time data synchronization for portfolio updates
- [ ] Production-ready error handling and monitoring

## User Stories

### Story 9.1: Supabase Foundation Setup

As a developer,
I want to establish complete Supabase backend infrastructure,
so that we have secure, scalable data persistence and real-time capabilities.

#### Acceptance Criteria
1. **Database Implementation**
   - Complete PostgreSQL schema deployment from architecture specification
   - All tables created with proper relationships and constraints
   - Database indexes optimized for query performance
   - Data seeding scripts for development and testing

2. **Authentication System**
   - Supabase Auth integration with email/password signup
   - Google OAuth provider configuration and testing
   - Email verification flow with custom email templates
   - Password reset functionality with secure token handling

3. **Row Level Security (RLS)**
   - RLS policies implemented for all user data tables
   - Security testing to verify data isolation between users
   - Admin access patterns for support and analytics
   - Performance testing of RLS policy queries

4. **Real-time Subscriptions**
   - Real-time channels for portfolio value updates
   - Live price update broadcasting to connected clients
   - Chat message synchronization for AI conversations
   - Connection management and error recovery

#### Technical Implementation
```sql
-- Complete database schema (from architecture doc)
-- Users, portfolios, holdings, AI sessions, alerts, subscriptions

-- Example RLS policy
CREATE POLICY "Users can manage their own portfolios" ON portfolios
  FOR ALL USING (auth.uid() = user_id);

-- Real-time configuration
-- Enable real-time for relevant tables
ALTER TABLE portfolios REPLICA IDENTITY FULL;
```

### Story 9.2: OpenAI Integration

As a user,
I want to interact with real AI personas that provide intelligent crypto advice,
so that I receive valuable, contextual guidance based on my actual portfolio data.

#### Acceptance Criteria
1. **AI Service Implementation**
   - OpenAI GPT-4 API integration with proper error handling
   - Three distinct persona prompt configurations (Buddy, Professor, Trader)
   - Context management including user portfolio data in prompts
   - Response streaming for real-time chat experience

2. **Persona-Specific Functionality**
   - **Buddy**: Casual, encouraging responses for beginners
   - **Professor**: Educational, detailed explanations with references
   - **Trader**: Professional analysis with technical insights
   - Dynamic persona switching within conversations

3. **Credit System Integration**
   - Real-time credit deduction with database updates
   - Credit allocation automation based on subscription tier
   - Usage tracking and analytics for business intelligence
   - Credit purchase system (future enhancement hook)

4. **Chat Session Management**
   - Persistent conversation history in database
   - Session context management across page refreshes
   - Chat session sharing and bookmarking
   - Export conversation functionality

#### Technical Implementation
```typescript
// AI Service implementation
export class AIService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateResponse(
    message: string,
    persona: PersonaType,
    context: UserContext
  ): Promise<string> {
    const systemPrompt = this.getPersonaPrompt(persona, context);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: this.getPersonaTemperature(persona),
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  }

  private getPersonaPrompt(persona: PersonaType, context: UserContext): string {
    // Persona-specific prompts with user context
  }
}
```

### Story 9.3: Stripe Payment Integration

As a business owner,
I want to monetize the platform through subscription tiers,
so that we can generate sustainable revenue while providing value-appropriate features to users.

#### Acceptance Criteria
1. **Subscription Management**
   - Stripe product and price configuration for Pro ($12.99) and Elite ($24.99) tiers
   - Subscription checkout flow integrated with existing UI
   - Customer portal for billing management and invoice access
   - Subscription modification and cancellation workflows

2. **Webhook Processing**
   - Secure webhook endpoint for Stripe subscription events
   - Real-time subscription status updates in database
   - Failed payment handling and retry logic
   - Customer lifecycle event processing (created, updated, deleted)

3. **Feature Gating Enhancement**
   - Dynamic feature access based on active subscription status
   - Graceful handling of expired subscriptions
   - Upgrade prompts at feature limit boundaries
   - Trial period management for new users

4. **Analytics Integration**
   - Subscription analytics dashboard for business metrics
   - Churn analysis and retention tracking
   - Revenue reporting and forecasting
   - Customer lifetime value calculations

#### Technical Implementation
```typescript
// Stripe service implementation
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createCheckoutSession(userId: string, tier: 'pro' | 'elite'): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: this.getPriceId(tier), quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: { userId, tier }
    });

    return session.url;
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
      // Additional webhook handlers
    }
  }
}
```

### Story 9.4: Data Migration and Persistence

As a developer,
I want to replace all mock data with real database persistence,
so that user data is properly stored and the application functions as a production system.

#### Acceptance Criteria
1. **User Data Migration**
   - Replace mock user profiles with Supabase user management
   - Migrate subscription tier logic to database-driven system
   - Implement credit balance tracking with transaction history
   - User preference storage and retrieval

2. **Portfolio Data Persistence**
   - Real portfolio creation, editing, and deletion with database storage
   - Holdings management with proper cost basis calculations
   - Performance tracking with historical data storage
   - Portfolio sharing and collaboration features

3. **AI Chat Persistence**
   - Conversation history storage with full search capabilities
   - Message threading and session management
   - AI response caching for improved performance
   - Conversation export and sharing functionality

4. **Price Data Management**
   - Historical price data storage for analytics
   - Price alert monitoring with database triggers
   - Market data caching for performance optimization
   - Data cleanup and archival policies

## Technical Implementation Notes

### Database Connection Management
```typescript
// Supabase client configuration
import { createServerComponentClient, createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Server-side client for API routes
export const getServerSupabase = () => createServerComponentClient({ cookies });

// Client-side client for components
export const getClientSupabase = () => createClientComponentClient();
```

### Environment Configuration
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# Application URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### API Route Updates
```typescript
// Example updated API route with real backend
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', session.user.id);

    return NextResponse.json(portfolios);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Migration Strategy

### Phase 1: Authentication and User Management
1. Replace mock authentication with Supabase Auth
2. Implement user registration and login flows
3. Add Google OAuth integration
4. Test authentication across all protected routes

### Phase 2: Database Integration
1. Deploy database schema to Supabase
2. Migrate portfolio management to real data
3. Implement AI chat persistence
4. Add real-time subscriptions

### Phase 3: Payment Integration
1. Configure Stripe products and webhooks
2. Implement subscription checkout flow
3. Add billing portal integration
4. Test subscription lifecycle

### Phase 4: AI Enhancement
1. Replace mock AI responses with OpenAI integration
2. Implement persona-specific prompts
3. Add conversation context management
4. Test credit system integration

## Functional Requirements Mapping
This epic addresses the following PRD functional requirements:
- **FR27**: Supabase backend integration with PostgreSQL database
- **FR28**: Real OpenAI API integration replacing mock responses
- **FR29**: Price alerts system with email notifications
- **FR1**: Secure account creation with Google OAuth integration
- **FR10**: Subscription to paid tiers through Stripe payment processing

## Risk Mitigation

### Data Security
- Implement proper RLS policies before production deployment
- Regular security audits of database access patterns
- Secure API key management and rotation
- User data encryption and compliance measures

### Performance Considerations
- Database query optimization and proper indexing
- API rate limiting for external services
- Caching strategies for frequently accessed data
- Real-time connection management and scaling

### Business Continuity
- Backup and disaster recovery procedures
- External service failover strategies
- Payment processing error handling
- User communication for service disruptions

## Next Steps After Epic Completion
1. Load testing and performance optimization
2. Security audit and penetration testing
3. User acceptance testing with real data
4. Preparation for Epic 10: Enhanced User Experience

## Dependencies
- Epic 1: Foundation & Authentication (foundation for backend integration)
- Epic 8: Missing Core Pages (pages to integrate with backend)
- External service accounts (Supabase, OpenAI, Stripe)
- Production environment setup and monitoring

## Definition of Done
- [ ] All user stories completed and tested
- [ ] Supabase backend fully functional with authentication
- [ ] OpenAI integration providing real AI responses
- [ ] Stripe payment system processing subscriptions
- [ ] All mock data replaced with persistent storage
- [ ] Real-time features working across platform
- [ ] Security testing completed and passed
- [ ] Performance benchmarks met
- [ ] Production deployment completed
- [ ] Monitoring and alerting configured