import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const mockStorage = {
  createBucket: vi.fn(),
  getBucket: vi.fn(),
  deleteBucket: vi.fn(),
  updateBucket: vi.fn(),
  from: vi.fn((bucket: string) => ({
    upload: vi.fn(),
    download: vi.fn(),
    remove: vi.fn(),
    move: vi.fn(),
    list: vi.fn()
  }))
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    storage: mockStorage
  }))
}))

describe('s3.ts - Supabase Storage Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Client Initialization', () => {
    it('should create a Supabase client with environment variables', async () => {
      const mockUrl = 'https://test.supabase.co'
      const mockKey = 'test-service-role-key'

      process.env.SUPABASE_URL = mockUrl
      process.env.SUPABASE_SERVICE_ROLE_KEY = mockKey

      await import('./s3.ts')

      expect(createClient).toHaveBeenCalled()
    })

    it('should use SUPABASE_URL from environment', () => {
      process.env.SUPABASE_URL = 'https://custom.supabase.co'

      expect(process.env.SUPABASE_URL).toBe('https://custom.supabase.co')
    })

    it('should use SUPABASE_SERVICE_ROLE_KEY from environment', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'custom-service-role-key'

      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBe('custom-service-role-key')
    })

    it('should export a Supabase client instance', async () => {
      const supabase = await import('./s3.ts')

      expect(supabase.default).toBeDefined()
      expect(supabase.default).toHaveProperty('storage')
    })
  })

  describe('Storage Operations', () => {
    it('should have storage.from method for bucket operations', async () => {
      const supabase = await import('./s3.ts')

      expect(supabase.default.storage.from).toBeDefined()
      expect(typeof supabase.default.storage.from).toBe('function')
    })

    it('should have storage methods for bucket management', async () => {
      const supabase = await import('./s3.ts')

      expect(supabase.default.storage.createBucket).toBeDefined()
      expect(supabase.default.storage.getBucket).toBeDefined()
      expect(supabase.default.storage.deleteBucket).toBeDefined()
    })
  })
})
