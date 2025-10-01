// Environment Variable Validation
// Validates required environment variables at runtime

export interface EnvConfig {
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string

  // APIs (Optional but recommended)
  OPENAI_API_KEY?: string
  COINGECKO_API_KEY?: string

  // Stripe (Required for payments)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string

  // App Config
  NODE_ENV: 'development' | 'production' | 'test'
  NEXT_PUBLIC_APP_URL?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  config: Partial<EnvConfig>
}

export function validateEnv(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required variables
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  // Check required
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  }

  // Optional but important
  const optional = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  }

  // Check optional
  for (const [key, value] of Object.entries(optional)) {
    if (!value) {
      warnings.push(`Missing optional environment variable: ${key}`)
    }
  }

  // Validate URL format
  if (required.NEXT_PUBLIC_SUPABASE_URL && !isValidUrl(required.NEXT_PUBLIC_SUPABASE_URL)) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      warnings.push('NEXT_PUBLIC_APP_URL should be set in production')
    }
    if (!process.env.OPENAI_API_KEY) {
      warnings.push('OPENAI_API_KEY should be set in production for AI features')
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      warnings.push('STRIPE_SECRET_KEY should be set in production for payments')
    }
  }

  const config: Partial<EnvConfig> = {
    ...required,
    ...optional,
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  }
}

export function logEnvValidation(): void {
  const result = validateEnv()

  console.log('\n🔍 Environment Validation:')
  console.log(`Environment: ${result.config.NODE_ENV}`)
  console.log(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`)

  if (result.errors.length > 0) {
    console.error('\n❌ Errors:')
    result.errors.forEach(error => console.error(`  - ${error}`))
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('✨ All environment variables configured correctly\n')
  }

  // Throw in production if invalid
  if (!result.isValid && process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment configuration in production')
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Export individual env getters with defaults
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  coingecko: {
    apiKey: process.env.COINGECKO_API_KEY,
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
} as const
