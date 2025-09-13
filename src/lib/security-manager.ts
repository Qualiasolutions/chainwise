import { z } from 'zod'
import { logger } from '@/lib/enhanced-logger'

interface SecurityConfig {
  maxRequestsPerMinute: number
  maxRequestsPerHour: number
  maxPayloadSize: number
  allowedOrigins: string[]
  rateLimitWindowMs: number
  encryptionKey?: string
}

interface SecurityMetrics {
  blockedRequests: number
  suspiciousActivities: number
  rateLimitExceeded: number
  invalidInputAttempts: number
  lastThreatDetected?: string
}

interface RateLimitEntry {
  count: number
  windowStart: number
  blocked: boolean
}

class SecurityManager {
  private readonly config: SecurityConfig
  private rateLimitMap = new Map<string, RateLimitEntry>()
  private blockedIPs = new Set<string>()
  private metrics: SecurityMetrics = {
    blockedRequests: 0,
    suspiciousActivities: 0,
    rateLimitExceeded: 0,
    invalidInputAttempts: 0
  }

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000,
      maxPayloadSize: 1024 * 1024, // 1MB
      allowedOrigins: [
        'http://localhost:3000',
        'https://chainwise.tech',
        'https://*.chainwise.tech'
      ],
      rateLimitWindowMs: 60000, // 1 minute
      ...config
    }

    // Cleanup blocked IPs and rate limit entries periodically
    setInterval(() => this.cleanup(), 300000) // Every 5 minutes
  }

  // Input validation and sanitization
  validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    try {
      const result = schema.parse(data)
      return { success: true, data: result }
    } catch (error) {
      this.metrics.invalidInputAttempts++
      
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        logger.warn('Input validation failed', { error: errorMessage, data })
        return { success: false, error: errorMessage }
      }
      
      logger.error('Unexpected validation error', error as Error, { data })
      return { success: false, error: 'Invalid input format' }
    }
  }

  // Rate limiting
  checkRateLimit(identifier: string, customLimit?: number): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const now = Date.now()
    const limit = customLimit || this.config.maxRequestsPerMinute
    const windowMs = this.config.rateLimitWindowMs
    
    const entry = this.rateLimitMap.get(identifier) || {
      count: 0,
      windowStart: now,
      blocked: false
    }

    // Reset window if expired
    if (now - entry.windowStart >= windowMs) {
      entry.count = 0
      entry.windowStart = now
      entry.blocked = false
    }

    entry.count++

    if (entry.count > limit) {
      entry.blocked = true
      this.metrics.rateLimitExceeded++
      
      logger.warn('Rate limit exceeded', {
        identifier,
        requests: entry.count,
        limit,
        window: `${windowMs}ms`
      })

      // Auto-block aggressive users
      if (entry.count > limit * 2) {
        this.blockIdentifier(identifier, 'Aggressive rate limit violation')
      }

      this.rateLimitMap.set(identifier, entry)
      
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.windowStart + windowMs
      }
    }

    this.rateLimitMap.set(identifier, entry)

    return {
      allowed: true,
      remainingRequests: Math.max(0, limit - entry.count),
      resetTime: entry.windowStart + windowMs
    }
  }

  // IP blocking and threat detection
  blockIdentifier(identifier: string, reason: string, durationMs: number = 3600000): void {
    this.blockedIPs.add(identifier)
    this.metrics.blockedRequests++
    
    logger.warn('Identifier blocked', {
      identifier,
      reason,
      duration: `${durationMs}ms`,
      timestamp: new Date().toISOString()
    })

    // Auto-unblock after duration
    setTimeout(() => {
      this.blockedIPs.delete(identifier)
      logger.info('Identifier unblocked', { identifier, reason })
    }, durationMs)
  }

  isBlocked(identifier: string): boolean {
    return this.blockedIPs.has(identifier)
  }

  // CSRF protection
  generateCSRFToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken || token !== sessionToken) {
      logger.warn('CSRF token validation failed', { 
        tokenProvided: !!token,
        sessionTokenExists: !!sessionToken,
        match: token === sessionToken
      })
      return false
    }
    return true
  }

  // Content Security Policy headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://js.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.coingecko.com https://vitals.vercel-insights.com wss://ws.supabase.co https://*.supabase.co",
        "frame-src 'self' https://js.stripe.com",
        "media-src 'self' data: blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 1000) // Limit length
  }

  sanitizeHTML(input: string): string {
    if (typeof input !== 'string') return ''
    
    // Basic HTML sanitization - remove dangerous elements and attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/style\s*=/gi, '')
  }

  // SQL injection prevention helpers
  validateSQLInput(input: string): boolean {
    const suspiciousPatterns = [
      /('|(\\'))|(;|--|\/\*|\*\/)/i,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
      /(script|javascript|vbscript)/i
    ]

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(input))
    
    if (isSuspicious) {
      this.metrics.suspiciousActivities++
      logger.warn('Suspicious SQL input detected', { input: input.substring(0, 100) })
    }

    return !isSuspicious
  }

  // API key validation and rotation tracking
  validateApiKey(key: string, expectedPrefix: string = 'pk_'): boolean {
    if (!key || typeof key !== 'string') {
      logger.warn('Invalid API key format', { keyProvided: !!key })
      return false
    }

    if (!key.startsWith(expectedPrefix)) {
      logger.warn('API key prefix mismatch', { prefix: expectedPrefix })
      return false
    }

    if (key.length < 32) {
      logger.warn('API key too short', { length: key.length })
      return false
    }

    return true
  }

  // Threat detection
  detectSuspiciousActivity(userAgent?: string, ipAddress?: string, endpoint?: string): boolean {
    let suspiciousScore = 0
    const reasons: string[] = []

    // Check user agent
    if (userAgent) {
      const suspiciousAgents = ['curl', 'wget', 'python-requests', 'bot', 'crawler']
      if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
        suspiciousScore += 1
        reasons.push('suspicious_user_agent')
      }
    }

    // Check for common attack patterns in endpoint
    if (endpoint) {
      const attackPatterns = ['.php', '.asp', '.jsp', 'wp-admin', 'phpmyadmin', '../', '.env']
      if (attackPatterns.some(pattern => endpoint.includes(pattern))) {
        suspiciousScore += 2
        reasons.push('attack_pattern_in_endpoint')
      }
    }

    // Check rate limiting violations
    if (ipAddress) {
      const rateLimitEntry = this.rateLimitMap.get(ipAddress)
      if (rateLimitEntry && rateLimitEntry.blocked) {
        suspiciousScore += 1
        reasons.push('rate_limit_violation')
      }
    }

    const isSuspicious = suspiciousScore >= 2
    
    if (isSuspicious) {
      this.metrics.suspiciousActivities++
      this.metrics.lastThreatDetected = new Date().toISOString()
      
      logger.warn('Suspicious activity detected', {
        score: suspiciousScore,
        reasons,
        userAgent,
        ipAddress,
        endpoint
      })

      // Auto-block on high suspicion
      if (suspiciousScore >= 3 && ipAddress) {
        this.blockIdentifier(ipAddress, `High suspicion score: ${suspiciousScore}`)
      }
    }

    return isSuspicious
  }

  // Payload size validation
  validatePayloadSize(contentLength: number): boolean {
    if (contentLength > this.config.maxPayloadSize) {
      logger.warn('Payload size exceeded', {
        size: contentLength,
        maxSize: this.config.maxPayloadSize
      })
      return false
    }
    return true
  }

  // CORS validation
  validateOrigin(origin: string): boolean {
    if (!origin) return false

    const isAllowed = this.config.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*')
        return new RegExp(`^${pattern}$`).test(origin)
      }
      return allowed === origin
    })

    if (!isAllowed) {
      logger.warn('Invalid origin detected', { origin })
    }

    return isAllowed
  }

  // Cleanup and maintenance
  private cleanup(): void {
    const now = Date.now()
    let cleanedRateLimit = 0
    
    // Clean expired rate limit entries
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now - entry.windowStart >= this.config.rateLimitWindowMs * 2) {
        this.rateLimitMap.delete(key)
        cleanedRateLimit++
      }
    }

    if (cleanedRateLimit > 0) {
      logger.debug('Security cleanup completed', {
        rateLimitEntriesRemoved: cleanedRateLimit,
        blockedIPs: this.blockedIPs.size
      })
    }
  }

  // Metrics and monitoring
  getMetrics(): SecurityMetrics & { rateLimitEntries: number; blockedIPs: number } {
    return {
      ...this.metrics,
      rateLimitEntries: this.rateLimitMap.size,
      blockedIPs: this.blockedIPs.size
    }
  }

  // Configuration updates
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    Object.assign(this.config, newConfig)
    logger.info('Security configuration updated', { config: this.config })
  }

  // Emergency lockdown
  enableLockdown(reason: string, durationMs: number = 3600000): void {
    logger.critical('Emergency lockdown activated', undefined, { reason, duration: durationMs })
    
    // Block all new requests
    const originalMaxRequests = this.config.maxRequestsPerMinute
    this.config.maxRequestsPerMinute = 0
    
    setTimeout(() => {
      this.config.maxRequestsPerMinute = originalMaxRequests
      logger.info('Emergency lockdown lifted', { reason })
    }, durationMs)
  }
}

// Export singleton instance
export const securityManager = new SecurityManager()

// Common validation schemas
export const commonSchemas = {
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  cryptoId: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  amount: z.number().positive().max(1000000000),
  uuid: z.string().uuid(),
  url: z.string().url(),
  apiKey: z.string().min(32).max(128)
}