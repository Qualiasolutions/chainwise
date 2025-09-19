# Frontend Architecture

## Overview

ChainWise frontend is built with Next.js 14 App Router, React 19, and TypeScript, featuring a purple glassmorphism design system with shadcn/ui components. The architecture emphasizes component reusability, type safety, and mobile-first responsive design.

## Component Architecture

### Component Organization

```
src/components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx          # Base button component
│   ├── card.tsx            # Card layout component
│   ├── input.tsx           # Form input component
│   ├── sidebar.tsx         # Sidebar navigation components
│   └── ...                 # Other shadcn/ui components
├── layout/                 # Layout components
│   ├── app-sidebar.tsx     # Main application sidebar
│   ├── nav-main.tsx        # Primary navigation
│   ├── nav-projects.tsx    # Project/portfolio navigation
│   ├── nav-user.tsx        # User profile navigation
│   └── team-switcher.tsx   # Organization switching
├── dashboard/              # Dashboard-specific components
│   ├── crypto-dashboard.tsx # Main dashboard view
│   ├── crypto-sidebar.tsx  # Dashboard sidebar
│   └── stats-cards.tsx     # Metrics display cards
├── portfolio/              # Portfolio management
│   ├── portfolio-list.tsx  # Portfolio grid/list view
│   ├── portfolio-card.tsx  # Individual portfolio card
│   ├── holding-form.tsx    # Add/edit holdings form
│   ├── analytics-view.tsx  # Portfolio analytics display
│   └── rebalance-tool.tsx  # Portfolio rebalancing
├── charts/                 # Data visualization
│   ├── portfolio-chart.tsx # Portfolio performance chart
│   ├── price-chart.tsx     # Crypto price charts
│   ├── allocation-chart.tsx # Asset allocation pie chart
│   └── correlation-matrix.tsx # Asset correlation heatmap
├── chat/                   # AI chat components
│   ├── chat-interface.tsx  # Main chat container
│   ├── persona-selector.tsx # AI persona switching
│   ├── message-bubble.tsx  # Individual chat messages
│   ├── chat-input.tsx      # Message input form
│   └── typing-indicator.tsx # AI typing animation
├── alerts/                 # Alert management
│   ├── alert-list.tsx      # User alerts display
│   ├── alert-form.tsx      # Create/edit alert form
│   ├── alert-card.tsx      # Individual alert display
│   └── alert-notifications.tsx # In-app notifications
├── market/                 # Market analysis
│   ├── market-overview.tsx # Global market stats
│   ├── trending-list.tsx   # Trending cryptocurrencies
│   ├── market-chart.tsx    # Market analysis charts
│   └── sector-performance.tsx # Crypto sector breakdown
└── providers/              # Context providers
    ├── auth-provider.tsx   # Authentication context
    ├── subscription-provider.tsx # Subscription state
    ├── theme-provider.tsx  # Theme management
    └── portfolio-provider.tsx # Portfolio context
```

### Component Design Patterns

#### 1. Compound Component Pattern
```typescript
// Portfolio card with sub-components
export function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100">
      <PortfolioCard.Header>
        <PortfolioCard.Title>{portfolio.name}</PortfolioCard.Title>
        <PortfolioCard.Actions />
      </PortfolioCard.Header>
      <PortfolioCard.Content>
        <PortfolioCard.Value value={portfolio.total_value_usd} />
        <PortfolioCard.Performance change={portfolio.profit_loss_percentage} />
      </PortfolioCard.Content>
    </Card>
  );
}

PortfolioCard.Header = function Header({ children }: { children: React.ReactNode }) {
  return <CardHeader className="pb-2">{children}</CardHeader>;
};

PortfolioCard.Title = function Title({ children }: { children: React.ReactNode }) {
  return <CardTitle className="text-sm font-medium">{children}</CardTitle>;
};
```

#### 2. Render Props Pattern
```typescript
// Data fetching component with render props
interface DataFetcherProps<T> {
  endpoint: string;
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({ endpoint, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData(endpoint)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<Portfolio[]> endpoint="/api/portfolio">
  {(portfolios, loading, error) => (
    <>
      {loading && <SkeletonGrid />}
      {error && <ErrorDisplay error={error} />}
      {portfolios && <PortfolioGrid portfolios={portfolios} />}
    </>
  )}
</DataFetcher>
```

#### 3. Higher-Order Component Pattern
```typescript
// Authentication HOC
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) return <LoginPrompt />;

    return <Component {...props} />;
  };
}

// Usage
export default withAuth(DashboardPage);
```

### Component Template

**Standard Component Structure:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // Specific props here
  data?: SomeDataType;
  onAction?: (value: string) => void;
}

export function Component({
  className,
  children,
  data,
  onAction,
  ...props
}: ComponentProps) {
  const [state, setState] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Side effects here
  }, [data]);

  const handleAction = (value: string) => {
    setLoading(true);
    // Handle action
    onAction?.(value);
    setLoading(false);
  };

  return (
    <div className={cn("base-styles", className)} {...props}>
      {loading ? (
        <Skeleton className="h-4 w-full" />
      ) : (
        <>
          {children}
          {/* Component content */}
        </>
      )}
    </div>
  );
}
```

## State Management Architecture

### State Organization

#### 1. Global State (React Context)
```typescript
// Authentication Context
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Implementation here

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 2. Subscription Context
```typescript
interface SubscriptionState {
  subscription: Subscription | null;
  tier: 'free' | 'pro' | 'elite';
  credits: number;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  upgradeToTier: (tier: 'pro' | 'elite') => Promise<void>;
}
```

#### 3. Portfolio Context
```typescript
interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  loading: boolean;
  createPortfolio: (data: CreatePortfolioData) => Promise<Portfolio>;
  updatePortfolio: (id: string, data: UpdatePortfolioData) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  selectPortfolio: (id: string) => void;
}
```

### Custom Hooks

#### 1. Data Fetching Hooks
```typescript
// Portfolio data hook
export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPortfolios();
      setPortfolios(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return {
    portfolios,
    loading,
    error,
    refetch: fetchPortfolios
  };
}
```

#### 2. Real-time Data Hooks
```typescript
// Real-time portfolio updates
export function usePortfolioRealtime(portfolioId: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    const supabase = createClientComponentClient();

    const channel = supabase
      .channel(`portfolio-${portfolioId}`)
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'portfolios', filter: `id=eq.${portfolioId}` },
          (payload) => setPortfolio(payload.new as Portfolio))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [portfolioId]);

  return portfolio;
}
```

#### 3. Form Management Hooks
```typescript
// Form handling with validation
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: z.ZodSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          const field = err.path[0] as keyof T;
          acc[field] = err.message;
          return acc;
        }, {} as Partial<Record<keyof T, string>>);
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    isValid: Object.keys(errors).length === 0
  };
}
```

## Routing Architecture

### App Router Structure
```
src/app/
├── (auth)/                 # Route group for authentication
│   ├── login/
│   │   └── page.tsx        # Login page
│   ├── register/
│   │   └── page.tsx        # Registration page
│   └── layout.tsx          # Auth layout (no sidebar)
├── dashboard/              # Protected dashboard routes
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── page.tsx            # Main dashboard
│   ├── portfolio/
│   │   ├── page.tsx        # Portfolio list
│   │   ├── create/
│   │   │   └── page.tsx    # Create portfolio
│   │   └── [id]/
│   │       ├── page.tsx    # Portfolio details
│   │       ├── edit/
│   │       │   └── page.tsx # Edit portfolio
│   │       └── analytics/
│   │           └── page.tsx # Portfolio analytics
│   ├── ai/
│   │   ├── page.tsx        # AI chat interface
│   │   └── [sessionId]/
│   │       └── page.tsx    # Specific chat session
│   ├── market/
│   │   ├── page.tsx        # Market analysis
│   │   └── [symbol]/
│   │       └── page.tsx    # Individual crypto analysis
│   ├── alerts/
│   │   ├── page.tsx        # Alert management
│   │   └── create/
│   │       └── page.tsx    # Create alert
│   ├── trading/
│   │   ├── page.tsx        # Trading interface
│   │   └── history/
│   │       └── page.tsx    # Trading history
│   └── settings/
│       ├── page.tsx        # General settings
│       ├── profile/
│       │   └── page.tsx    # Profile management
│       ├── billing/
│       │   └── page.tsx    # Subscription management
│       └── preferences/
│           └── page.tsx    # User preferences
├── api/                    # API routes (see API specification)
├── globals.css             # Global styles
├── layout.tsx              # Root layout
├── page.tsx                # Landing page
├── pricing/
│   └── page.tsx            # Pricing page
└── about/
    └── page.tsx            # About page
```

### Layout Components

#### Root Layout
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Dashboard Layout
```typescript
// app/dashboard/layout.tsx
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-4 pt-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
```

### Route Protection

#### Protected Route Component
```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: 'pro' | 'elite';
}

export function ProtectedRoute({ children, requiredTier }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (requiredTier && user && !hasRequiredTier(user.subscription_tier, requiredTier)) {
      router.push('/dashboard?upgrade=true');
    }
  }, [user, requiredTier, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function hasRequiredTier(userTier: string, requiredTier: string): boolean {
  const tierHierarchy = { free: 0, pro: 1, elite: 2 };
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}
```

## Design System Implementation

### Theme Configuration

#### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Purple theme colors
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Glassmorphism backgrounds
        glass: {
          50: 'rgba(255, 255, 255, 0.1)',
          100: 'rgba(255, 255, 255, 0.2)',
          200: 'rgba(255, 255, 255, 0.3)',
        },
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

#### CSS Variables and Classes
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light theme variables */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 20% 98%;
    /* ... other variables */
  }

  .dark {
    /* Dark theme variables */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 263.4 70% 50.4%;
    --primary-foreground: 210 20% 98%;
    /* ... other variables */
  }
}

@layer components {
  .glassmorphism {
    @apply backdrop-blur-glass bg-glass-100 border border-glass-200;
  }

  .ai-gradient {
    @apply bg-gradient-to-r from-blue-600 to-purple-600;
  }

  .ai-card {
    @apply glassmorphism rounded-lg shadow-lg;
  }

  .metric-card {
    @apply bg-card border rounded-lg p-6 transition-all hover:shadow-lg;
  }
}
```

### Component Styling Patterns

#### Consistent Card Component
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  const baseClasses = 'rounded-lg border p-6 shadow-sm';
  const variantClasses = {
    default: 'bg-card text-card-foreground',
    glass: 'glassmorphism',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
}
```

## Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for large components
const AdvancedAnalytics = dynamic(
  () => import('@/components/portfolio/advanced-analytics'),
  {
    loading: () => <SkeletonAnalytics />,
    ssr: false
  }
);

// Route-based code splitting
const TradingInterface = dynamic(
  () => import('@/components/trading/trading-interface'),
  {
    loading: () => <LoadingSpinner />,
  }
);
```

### Image Optimization
```typescript
import Image from 'next/image';

export function CryptoIcon({ symbol, size = 24 }: { symbol: string; size?: number }) {
  return (
    <Image
      src={`/icons/crypto/${symbol.toLowerCase()}.png`}
      alt={symbol}
      width={size}
      height={size}
      className="rounded-full"
      priority={size > 32} // Prioritize larger icons
    />
  );
}
```

### Bundle Analysis
```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
});
```

This frontend architecture provides a solid foundation for building a scalable, maintainable, and performant React application with excellent user experience and developer productivity.