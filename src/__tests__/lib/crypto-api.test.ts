import { describe, it, expect } from 'vitest'
import { formatPrice, formatPercentage, formatMarketCap } from '@/lib/crypto-api'

describe('Crypto API Utilities', () => {
  describe('formatPrice', () => {
    it('should format prices correctly', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56')
      // Price formatting uses 4-8 decimal places for small values
      expect(formatPrice(0.123456)).toMatch(/\$0\.123/)
      expect(formatPrice(1000000)).toBe('$1,000,000.00')
    })

    it('should handle zero and negative values', () => {
      // formatPrice uses 4 decimal places minimum for values < 1
      expect(formatPrice(0)).toMatch(/\$0\.00/)
      // Negative values use the same formatting rules (4 decimals for < 1)
      expect(formatPrice(-100)).toMatch(/-\$100\.00/)
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      // formatPercentage adds + for positive values
      expect(formatPercentage(12.345)).toBe('+12.35%')
      expect(formatPercentage(-5.678)).toBe('-5.68%')
      expect(formatPercentage(0)).toBe('+0.00%')
    })

    it('should handle edge cases', () => {
      expect(formatPercentage(100)).toBe('+100.00%')
      expect(formatPercentage(0.01)).toBe('+0.01%')
    })
  })

  describe('formatMarketCap', () => {
    it('should format large market caps', () => {
      expect(formatMarketCap(1000000000)).toBe('$1.00B')
      expect(formatMarketCap(1500000000)).toBe('$1.50B')
      expect(formatMarketCap(1000000)).toBe('$1.00M')
    })

    it('should handle small values', () => {
      // formatMarketCap uses toLocaleString for values < 1M
      expect(formatMarketCap(500000)).toBe('$500,000')
      expect(formatMarketCap(1000)).toBe('$1,000')
    })
  })
})
