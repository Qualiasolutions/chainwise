# ChainWise Deployment Guide

## 🚀 Vercel Auto-Deployment Setup

ChainWise is configured for automatic deployment to Vercel with the following setup:

### GitHub Repository
- **Repository**: https://github.com/Qualiasolutions/chainwisefinal
- **Branch**: `main` (auto-deploys on push)
- **Vercel Project**: https://vercel.com/qualiasolutions-glluztech/chainwise

### Deployment Configuration

The project includes:
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `.env.example` - Environment variables template
- ✅ Next.js 15.5.3 optimized build settings

### Required Environment Variables

Set these in Vercel dashboard (Settings > Environment Variables):

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://vmnuzwoocympormyizsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional (for enhanced features)
OPENAI_API_KEY=sk-...                    # For real AI chat
STRIPE_PUBLISHABLE_KEY=pk_...            # For subscriptions
STRIPE_SECRET_KEY=sk_...                 # For subscriptions
COINGECKO_API_KEY=CG-...                 # For enhanced API limits
```

### Automatic Deployment Flow

1. **Push to GitHub** → Triggers Vercel build
2. **Vercel Build** → `npm run build` with Turbopack
3. **Deploy** → Live at https://chainwise.vercel.app
4. **DNS** → Custom domain can be configured in Vercel

### Build Settings

- **Build Command**: `npm run build` (with Turbopack optimization)
- **Output Directory**: `.next` (Next.js default)
- **Node Version**: 18.x
- **API Functions**: Serverless with 30s timeout

### Database Integration

- **Database**: Supabase PostgreSQL (already configured)
- **Project ID**: `vmnuzwoocympormyizsc`
- **Tables**: 10 tables with full schema applied via MCP
- **Security**: Row Level Security enabled

### Features Available on Deploy

✅ **Working Features:**
- Complete AI chat system with 3 personas
- Portfolio management with real-time calculations
- Market data via CoinGecko API
- Advanced trading interface
- Analytics dashboard
- Dark/light theme system
- Responsive mobile design

⚡ **API Integration:**
- Full REST API for all features
- Supabase MCP integration (schema complete)
- Credit system and user management
- Notifications and alerts system

### Post-Deployment Steps

1. **Verify Environment Variables** in Vercel dashboard
2. **Test Core Features** (portfolio, AI chat, market data)
3. **Configure Custom Domain** (optional)
4. **Set up Monitoring** and analytics
5. **Enable OpenAI API** for real AI responses

### Support & Monitoring

- **Logs**: Available in Vercel dashboard
- **Performance**: Web Vitals automatically tracked
- **Errors**: Integrated error tracking
- **Analytics**: Built-in Vercel Analytics

## 🎯 Production Ready!

ChainWise is fully prepared for production deployment with:
- ✅ Professional codebase architecture
- ✅ Complete database schema
- ✅ Scalable API infrastructure
- ✅ Modern UI/UX design
- ✅ Security best practices
- ✅ Real-time functionality

Deploy with confidence! 🚀