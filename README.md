# ChainWise - AI-Powered Crypto SaaS Platform

An advanced cryptocurrency investment management platform with AI-powered insights, portfolio analytics, and subscription-based features.

## 🚀 Features

### Core Features
- **AI-Powered Chat**: Buddy, Professor, and Trader AI personas
- **Advanced Portfolio Analytics**: Risk scoring, performance attribution, correlation analysis
- **Price Alerts**: Custom alerts with email and in-app notifications
- **Market Intelligence**: Real-time crypto data and insights
- **Subscription Management**: Free, Pro, and Elite tiers with credit system

### Advanced Analytics
- **Risk Assessment**: Comprehensive risk metrics (VaR, Sharpe Ratio, Beta)
- **Performance Attribution**: Track what drives portfolio performance
- **Benchmarking**: Compare against market indices
- **Correlation Analysis**: Asset correlation matrix
- **Value at Risk**: 95% confidence VaR calculations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe subscriptions
- **AI**: OpenAI GPT-4
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (chainwise-sand.vercel.app)
- **Email**: Nodemailer with SMTP

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- OpenAI API key
- SMTP email service

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Qualiasolutions/ChainwiseNew.git
   cd ChainwiseNew
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local` with:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/chainwise"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   OPENAI_API_KEY="sk-..."
   COINGECKO_API_KEY="..."
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Connect your GitHub repository to Vercel**
   - Import your project on Vercel
   - Connect to the ChainWise GitHub repository

2. **Configure environment variables**
   Add all environment variables from `.env.local` to Vercel:
   - Go to Project Settings → Environment Variables
   - Add each variable from your `.env.local` file

3. **Database setup for production**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to production database
   npx prisma db push
   ```

4. **Deploy**
   Vercel will automatically deploy on every push to the main branch.

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers
- `POST /api/auth/register` - User registration

### Portfolio Management
- `GET /api/portfolio` - Get user portfolios
- `POST /api/portfolio` - Create new portfolio
- `GET /api/portfolio/[id]` - Get specific portfolio
- `GET /api/portfolio/[id]/analytics` - Portfolio analytics
- `GET /api/portfolio/[id]/advanced-analytics` - Advanced risk analytics
- `POST /api/portfolio/[id]/update-values` - Update portfolio values

### AI Chat
- `POST /api/chat` - AI chat with personas
- `GET /api/chat` - Get chat history

### Alerts
- `GET /api/alerts` - Get user alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts` - Update alert
- `DELETE /api/alerts` - Delete alert
- `POST /api/alerts/check` - Check and process alerts

### Credits & Billing
- `GET /api/credits/balance` - Get credit balance
- `GET /api/credits/history` - Credit transaction history
- `POST /api/credits/spend` - Spend credits

### Payments
- `POST /api/stripe/create-checkout-session` - Create subscription
- `POST /api/stripe/create-portal-session` - Billing portal
- `POST /api/stripe/webhook` - Stripe webhooks

## 🔧 Configuration

### Database Schema
The application uses Prisma ORM with the following main models:
- `User` - User accounts and subscriptions
- `Portfolio` - User portfolios
- `PortfolioHolding` - Individual holdings
- `AiChatSession` - AI chat conversations
- `UserAlert` - Price alerts
- `CreditTransaction` - Credit usage tracking
- `Notification` - Notification system

### Subscription Tiers

#### Free Tier
- 1 portfolio, 3 holdings
- 3 AI credits/month
- Basic market data
- 3 alerts

#### Pro Tier ($12.99/month)
- 3 portfolios, 20 holdings each
- 50 AI credits/month
- Professor AI persona
- Advanced analytics
- 10 alerts
- Weekly reports

#### Elite Tier ($24.99/month)
- 10 portfolios, unlimited holdings
- 200 AI credits/month
- All AI personas (Buddy, Professor, Trader)
- Professional analytics
- Unlimited alerts
- Weekly + Monthly reports
- Whale tracking

## 🧪 Testing

```bash
# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@chainwise.com

## 🔄 Recent Updates

### Phase 3 Implementation (Latest)
- ✅ **Advanced Portfolio Analytics**: Risk scoring, performance attribution, correlation analysis
- ✅ **Alert Notifications**: Email and in-app notification system
- ✅ **Professional Dashboard**: Enhanced UI with subscription insights
- ✅ **API Protection**: Complete feature gating across all endpoints
- ✅ **Database Optimization**: Improved schema and relationships

### Phase 2 Implementation
- ✅ **Alert System**: Price alerts with tier-based quotas
- ✅ **Dashboard Enhancement**: Subscription status and upgrade flows
- ✅ **Portfolio Management**: Enhanced CRUD with permission checks
- ✅ **Permission Framework**: Comprehensive tier-based access control
- ✅ **Credit System**: Automatic credit allocation and consumption

### Phase 1 Implementation
- ✅ **Authentication**: NextAuth.js with Google OAuth
- ✅ **Subscription System**: Stripe integration with webhooks
- ✅ **AI Chat**: GPT-4 integration with personas
- ✅ **Database Schema**: Complete PostgreSQL setup
- ✅ **UI Framework**: Tailwind CSS + shadcn/ui components

---

**ChainWise** - Transforming cryptocurrency investment management with AI-powered intelligence. 🚀
