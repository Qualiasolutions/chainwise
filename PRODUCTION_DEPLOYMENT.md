# Production Deployment Checklist

## Pre-Deployment Validation

### 1. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- [ ] `OPENAI_API_KEY` - OpenAI API key for AI chat features
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (server-side only)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- [ ] `COINGECKO_API_KEY` - CoinGecko API key (optional, improves rate limits)
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (e.g., https://chainwise.app)

### 2. Database (Supabase)
- [ ] All migrations applied successfully
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Database functions created and tested
- [ ] Indexes created for performance
- [ ] Sample data removed (if any)
- [ ] Backup strategy configured

### 3. Authentication
- [ ] Google OAuth configured with production credentials
- [ ] Email templates customized (optional)
- [ ] Password reset flow tested
- [ ] Session management configured
- [ ] Rate limiting enabled

### 4. Payment Processing (Stripe)
- [ ] Live Stripe keys configured (not test mode)
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] All subscription plans created in Stripe
- [ ] Payment success/failure flows tested
- [ ] Invoice generation tested

### 5. API Integrations
- [ ] CoinGecko API tested with live data
- [ ] OpenAI API tested with actual responses
- [ ] Rate limiting configured for all APIs
- [ ] Error handling tested for API failures
- [ ] Fallback mechanisms in place

### 6. Code Quality
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No critical ESLint errors
- [ ] All tests passing (`npm run test:run`)
- [ ] Code coverage > 60% for critical paths
- [ ] No console.log statements in production code

### 7. Performance
- [ ] Lighthouse score > 90 for performance
- [ ] Images optimized and using Next.js Image component
- [ ] Code splitting configured
- [ ] Bundle size analyzed and optimized
- [ ] Lazy loading implemented where appropriate

### 8. Security
- [ ] Environment variables never exposed to client
- [ ] API routes protected with authentication
- [ ] CORS configured correctly
- [ ] Rate limiting on all public endpoints
- [ ] SQL injection protection verified (using RLS)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### 9. Monitoring & Logging
- [ ] Error tracking configured (Sentry recommended)
- [ ] Performance monitoring enabled
- [ ] Database query monitoring
- [ ] API endpoint monitoring
- [ ] Uptime monitoring configured

### 10. User Experience
- [ ] 404 page customized
- [ ] Error boundaries implemented
- [ ] Loading states on all async operations
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed
- [ ] Accessibility audit passed (WCAG 2.1 AA)

## Deployment Steps

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Push latest changes
   git add .
   git commit -m "Production-ready deployment"
   git push origin main
   ```

2. **Configure Vercel Project**
   - Go to https://vercel.com
   - Import Git repository
   - Select Next.js framework preset
   - Set environment variables from checklist

3. **Deploy**
   - Click "Deploy"
   - Verify deployment at preview URL
   - Promote to production

### Manual Deployment Steps

1. **Build Production Bundle**
   ```bash
   npm run build
   ```

2. **Test Production Build Locally**
   ```bash
   npm run start
   ```

3. **Deploy to Hosting Provider**
   - Upload `.next` folder
   - Set environment variables
   - Configure domain and SSL

## Post-Deployment Validation

### Critical User Flows
- [ ] User registration and login
- [ ] Portfolio creation and management
- [ ] AI chat functionality
- [ ] Premium tool usage (Whale Tracker, AI Reports, etc.)
- [ ] Credit system working correctly
- [ ] Subscription upgrade flow
- [ ] Payment processing end-to-end
- [ ] Password reset flow

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] CDN configured for static assets

### Monitoring Setup
- [ ] Error alerts configured
- [ ] Performance alerts configured
- [ ] Database alerts configured
- [ ] Uptime monitoring active

## Rollback Plan

If critical issues are discovered:

1. **Immediate Rollback (Vercel)**
   - Go to Vercel dashboard
   - Select previous deployment
   - Click "Promote to Production"

2. **Manual Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback**
   - If database changes: use Supabase migration rollback
   - Restore from latest backup if necessary

## Production URLs

- **Application**: https://[your-domain]
- **API Endpoints**: https://[your-domain]/api/*
- **Stripe Webhook**: https://[your-domain]/api/webhooks/stripe
- **Status Page**: https://[your-domain]/api/health

## Support Contacts

- **Database Issues**: Supabase support
- **Payment Issues**: Stripe support
- **Hosting Issues**: Vercel support
- **DNS/Domain Issues**: Domain registrar support

## Maintenance Schedule

- **Database Backups**: Daily automatic
- **Dependency Updates**: Weekly review
- **Security Patches**: Immediate application
- **Performance Reviews**: Monthly
- **User Analytics Review**: Weekly

## Success Metrics

Track these metrics post-deployment:

- **Uptime**: Target 99.9%
- **Error Rate**: < 0.1%
- **Average Response Time**: < 500ms
- **User Retention**: Track week-over-week
- **Conversion Rate**: Free to Paid upgrades
- **Credit Usage**: Monitor for abuse

## Emergency Procedures

### Database Emergency
1. Check Supabase dashboard
2. Review database logs
3. Verify RLS policies
4. Check connection pool

### API Emergency
1. Check API logs
2. Verify third-party service status
3. Enable fallback mode
4. Contact service provider

### Payment Emergency
1. Check Stripe dashboard
2. Verify webhook deliveries
3. Review failed payments
4. Contact Stripe support

---

**Last Updated**: October 1, 2025
**Deployment Version**: 1.0.0
**Status**: Production Ready ✅
