import { describe, it, expect } from 'vitest'
import {
  APIError,
  validateRequired,
  validateAuth,
  validateProfile,
  validateCredits,
  validateTier,
  validateEnum
} from '@/lib/api-error-handler'

describe('APIError', () => {
  it('should create an APIError with all properties', () => {
    const error = new APIError('Test error', 400, 'TEST_CODE', { detail: 'test' })
    expect(error.message).toBe('Test error')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('TEST_CODE')
    expect(error.details).toEqual({ detail: 'test' })
  })

  it('should default to 500 status code', () => {
    const error = new APIError('Test error')
    expect(error.statusCode).toBe(500)
  })
})

describe('validateRequired', () => {
  it('should not throw when all required fields are present', () => {
    const data = { name: 'test', email: 'test@test.com' }
    expect(() => validateRequired(data, ['name', 'email'])).not.toThrow()
  })

  it('should throw when required fields are missing', () => {
    const data = { name: 'test' }
    expect(() => validateRequired(data, ['name', 'email'])).toThrow(APIError)
    expect(() => validateRequired(data, ['name', 'email'])).toThrow('Missing required fields: email')
  })

  it('should allow 0 as a valid value', () => {
    const data = { amount: 0 }
    expect(() => validateRequired(data, ['amount'])).not.toThrow()
  })
})

describe('validateAuth', () => {
  it('should not throw when session exists', () => {
    const session = { user: { id: '123' } }
    expect(() => validateAuth(session)).not.toThrow()
  })

  it('should throw when session is null', () => {
    expect(() => validateAuth(null)).toThrow(APIError)
    expect(() => validateAuth(null)).toThrow('Unauthorized')
  })
})

describe('validateProfile', () => {
  it('should not throw when profile exists', () => {
    const profile = { id: '123', email: 'test@test.com' }
    expect(() => validateProfile(profile)).not.toThrow()
  })

  it('should throw when profile is null', () => {
    expect(() => validateProfile(null)).toThrow(APIError)
    expect(() => validateProfile(null)).toThrow('User profile not found')
  })
})

describe('validateCredits', () => {
  it('should not throw when credits are sufficient', () => {
    expect(() => validateCredits(10, 5)).not.toThrow()
    expect(() => validateCredits(5, 5)).not.toThrow()
  })

  it('should throw when credits are insufficient', () => {
    expect(() => validateCredits(3, 5)).toThrow(APIError)
    expect(() => validateCredits(3, 5)).toThrow('Insufficient credits')
  })
})

describe('validateTier', () => {
  it('should not throw when user tier is sufficient', () => {
    expect(() => validateTier('pro', 'free')).not.toThrow()
    expect(() => validateTier('elite', 'pro')).not.toThrow()
    expect(() => validateTier('elite', 'elite')).not.toThrow()
  })

  it('should throw when user tier is insufficient', () => {
    expect(() => validateTier('free', 'pro')).toThrow(APIError)
    expect(() => validateTier('pro', 'elite')).toThrow(APIError)
  })
})

describe('validateEnum', () => {
  it('should not throw when value is in valid values', () => {
    expect(() => validateEnum('apple', ['apple', 'banana'], 'fruit')).not.toThrow()
  })

  it('should throw when value is not in valid values', () => {
    expect(() => validateEnum('orange', ['apple', 'banana'], 'fruit')).toThrow(APIError)
    expect(() => validateEnum('orange', ['apple', 'banana'], 'fruit')).toThrow('Invalid fruit')
  })
})
